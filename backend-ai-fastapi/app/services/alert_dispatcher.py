import os
import httpx
import datetime
from typing import Dict, Any

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
TEAMS_WEBHOOK_URL = os.getenv("TEAMS_WEBHOOK_URL", "")
PAGERDUTY_ROUTING_KEY = os.getenv("PAGERDUTY_ROUTING_KEY", "")

class MultiChannelAlertDispatcher:
    """
    Enterprise multi-channel alert dispatcher for Slack, MS Teams, and PagerDuty
    """

    async def send_slack_alert(self, anomaly_score: float, duration_ms: float, payload_kb: float) -> bool:
        if not SLACK_WEBHOOK_URL:
            print(f"[Slack Simulation Alert] IsolationForest Anomaly Score: {anomaly_score} (Duration: {duration_ms}ms)")
            return True

        slack_payload = {
            "text": f"🚨 *NexusOps Anomaly Alert* - Score: {anomaly_score}",
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": "🚨 NexusOps IsolationForest Anomaly Detected"}
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Anomaly Score:*\n{anomaly_score}"},
                        {"type": "mrkdwn", "text": f"*Execution Duration:*\n{duration_ms} ms"},
                        {"type": "mrkdwn", "text": f"*Payload Size:*\n{payload_kb} KB"},
                        {"type": "mrkdwn", "text": f"*Timestamp:*\n{datetime.datetime.utcnow().isoformat()}"}
                    ]
                }
            ]
        }
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.post(SLACK_WEBHOOK_URL, json=slack_payload)
                return resp.status_code in (200, 201, 202, 204)
        except Exception as e:
            print(f"Slack alert error: {e}")
            return False

    async def send_teams_alert(self, anomaly_score: float, duration_ms: float) -> bool:
        if not TEAMS_WEBHOOK_URL:
            print(f"[MS Teams Simulation Alert] IsolationForest Anomaly Score: {anomaly_score}")
            return True

        teams_payload = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": "FF0000",
            "summary": f"NexusOps Anomaly Alert: {anomaly_score}",
            "sections": [{
                "activityTitle": "🚨 NexusOps IsolationForest Anomaly Detected",
                "facts": [
                    {"name": "Anomaly Score", "value": str(anomaly_score)},
                    {"name": "Duration", "value": f"{duration_ms} ms"},
                    {"name": "Engine", "value": "FastAPI IsolationForest"}
                ]
            }]
        }
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.post(TEAMS_WEBHOOK_URL, json=teams_payload)
                return resp.status_code in (200, 201, 202, 204)
        except Exception as e:
            print(f"Teams alert error: {e}")
            return False

    async def send_pagerduty_event(self, anomaly_score: float, duration_ms: float) -> bool:
        if not PAGERDUTY_ROUTING_KEY:
            print(f"[PagerDuty Simulation Incident] High-Severity Anomaly Score: {anomaly_score}")
            return True

        pd_payload = {
            "routing_key": PAGERDUTY_ROUTING_KEY,
            "event_action": "trigger",
            "payload": {
                "summary": f"NexusOps Anomaly Score {anomaly_score} exceeded threshold",
                "severity": "critical" if anomaly_score > 0.85 else "warning",
                "source": "FastAPI AI Engine",
                "custom_details": {
                    "anomaly_score": anomaly_score,
                    "execution_duration_ms": duration_ms
                }
            }
        }
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.post("https://events.pagerduty.com/v2/enqueue", json=pd_payload)
                return resp.status_code in (200, 201, 202)
        except Exception as e:
            print(f"PagerDuty alert error: {e}")
            return False

    async def dispatch_all_channels(self, anomaly_score: float, duration_ms: float, payload_kb: float) -> Dict[str, bool]:
        slack_ok = await self.send_slack_alert(anomaly_score, duration_ms, payload_kb)
        teams_ok = await self.send_teams_alert(anomaly_score, duration_ms)
        pd_ok = await self.send_pagerduty_event(anomaly_score, duration_ms)

        return {
            "slack_dispatched": slack_ok,
            "teams_dispatched": teams_ok,
            "pagerduty_dispatched": pd_ok
        }

alert_dispatcher = MultiChannelAlertDispatcher()
