require('dotenv').config();
const fs = require('fs');

if (!process.env.SLACK_WEBHOOK_URL) {
  console.error("SLACK_WEBHOOK_URL is missing in .env");
  process.exit(1);
}

const alertmanagerConfig = `
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - send_resolved: true
        text: "{{ .CommonAnnotations.description }}"
        title: "{{ .CommonAnnotations.summary }}"
        title_link: "https://wizfi-grafana.duckdns.org"
        color: '{{ if eq .Status "firing" }}danger{{ else }}good{{ end }}'
        api_url: '${process.env.SLACK_WEBHOOK_URL}'
        channel: '#alerts'
        username: 'Prometheus Alert'
        icon_emoji: ':fire:'
`;

// Properly indent the entire config for stringData
const indentedConfig = alertmanagerConfig
  .split('\n')
  .map(line => '      ' + line)  // 6 spaces total (2 for stringData + 4 for value)
  .join('\n');

const secretYaml = `apiVersion: v1
kind: Secret
metadata:
  name: alertmanager-config
  namespace: monitoring
stringData:
  alertmanager.yaml: |
${indentedConfig}
`;

fs.writeFileSync('alertmanager-config.yaml', secretYaml);
console.log(" Generated alertmanager-config.yaml from .env");
console.log(" Apply with: kubectl apply -f alertmanager-config.yaml");