from typing import Dict, Any

class WorkflowRulesEngine:
    """
    Evaluates dynamic trigger-condition-action workflow rules against event payloads
    """

    def evaluate_condition(self, condition: Dict[str, Any], payload: Dict[str, Any]) -> bool:
        for key, expected_val in condition.items():
            if key.endswith("Gt"):
                field_name = key[:-2]
                field_name = field_name[0].lower() + field_name[1:]
                if payload.get(field_name, 0) <= expected_val:
                    return False
            elif key.endswith("Lt"):
                field_name = key[:-2]
                field_name = field_name[0].lower() + field_name[1:]
                if payload.get(field_name, 0) >= expected_val:
                    return False
            else:
                if payload.get(key) != expected_val:
                    return False
        return True

    def process_event(self, trigger_event: str, condition: Dict[str, Any], action_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        match_found = self.evaluate_condition(condition, payload)
        
        return {
            "trigger_event": trigger_event,
            "condition_matched": match_found,
            "action_type": action_type if match_found else "NOOP",
            "executed": match_found
        }

rules_engine = WorkflowRulesEngine()
