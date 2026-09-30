package com.nexusops.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.nexusops.viewmodel.EnterpriseOpsViewModel

@Composable
fun EnterpriseOpsScreen(viewModel: EnterpriseOpsViewModel = viewModel()) {
    val summary by viewModel.opsState.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Column {
                Text(
                    text = "Enterprise Ops & Security",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Multi-Region HA, FinOps, Canary Rollouts & SOC 2 Compliance",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )
            }
        }

        // 1. Multi-Region HA Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🌐 Multi-Region Active-Active", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Surface(color = Color(0xFF10B981).copy(alpha = 0.15f), shape = RoundedCornerShape(50)) {
                            Text("RPO < 1s", color = Color(0xFF34D399), fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Primary Leader: ${summary.multiRegion.primary_region} | Failover: ${summary.multiRegion.secondary_region}", fontSize = 12.sp, color = Color(0xFFCBD5E1))
                    Text("Replication Lag: ${summary.multiRegion.replication_lag_ms} ms | Route53: ${summary.multiRegion.route53_health}", fontSize = 11.sp, fontFamily = FontFamily.Monospace, color = Color(0xFF38BDF8))
                }
            }
        }

        // 2. FinOps Cloud Cost Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("💰 FinOps Cost Optimization", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Surface(color = Color(0xFF14B8A6).copy(alpha = 0.15f), shape = RoundedCornerShape(50)) {
                            Text("${summary.finOps.potential_savings_percentage}% Saved", color = Color(0xFF2DD4BF), fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Optimized Spend: \$9,100 / mo (Saved \$${summary.finOps.potential_savings_usd.toInt()}/mo)", fontSize = 12.sp, color = Color(0xFF34D399), fontWeight = FontWeight.Bold)
                    Text("Unattached EBS Volumes Pruned: ${summary.finOps.unattached_volumes_found}", fontSize = 11.sp, color = Color(0xFF94A3B8))
                }
            }
        }

        // 3. Argo Canary Rollouts Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🐥 Canary Progressive Delivery", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Surface(color = Color(0xFFA855F7).copy(alpha = 0.15f), shape = RoundedCornerShape(50)) {
                            Text("Step 2 (25%)", color = Color(0xFFC084FC), fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Rollout: ${summary.canary.rollout_name} (${summary.canary.canary_version})", fontSize = 12.sp, color = Color.White)
                    Text("Traffic Split: ${summary.canary.stable_percentage}% Stable / ${summary.canary.canary_percentage}% Canary | Prometheus: ${summary.canary.prometheus_analysis}", fontSize = 11.sp, color = Color(0xFFC084FC), fontFamily = FontFamily.Monospace)
                }
            }
        }

        // 4. Incident War Room Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🚨 Incident War Room & PagerDuty", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Surface(color = Color(0xFFF43F5E).copy(alpha = 0.15f), shape = RoundedCornerShape(50)) {
                            Text(summary.activeIncident.severity, color = Color(0xFFFB7185), fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("${summary.activeIncident.incident_id}: ${summary.activeIncident.title}", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.SemiBold)
                    Text("On-Call: ${summary.activeIncident.on_call_engineer} | MTTR: ${summary.activeIncident.mttr_minutes} min", fontSize = 11.sp, color = Color(0xFF94A3B8))
                }
            }
        }

        // 5. SOC 2 & ISO 27001 Compliance Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🛡️ SOC 2 & ISO 27001 Compliance", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Surface(color = Color(0xFF10B981).copy(alpha = 0.15f), shape = RoundedCornerShape(50)) {
                            Text("${summary.compliance.overall_score_percentage}% Score", color = Color(0xFF34D399), fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(summary.compliance.audit_status, fontSize = 12.sp, color = Color(0xFF34D399), fontWeight = FontWeight.Bold)
                    Text("Secret Leaks: 0 | Verified Controls: 5/5 | Frameworks: SOC 2, ISO 27001, HIPAA", fontSize = 11.sp, color = Color(0xFF94A3B8))
                }
            }
        }
    }
}
