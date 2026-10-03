# BPMN sample provenance

These downloadable BPMN examples are copied byte-for-byte from the bpmn-xyflow
library checkout used by this demo. The demo preserves the original XML,
including exporter metadata and extension namespaces.

- `scenarios/order-payment-delivery.bpmn`
- `scenarios/approval-rejection-rework.bpmn`
- `scenarios/booking-timeout-compensation.bpmn`

The three scenarios were authored as synthetic business-process regression
fixtures for this project's core-parity work. Their source is
`test/fixtures/scenarios/` in bpmn-xyflow; they are examples, not production data.

`complex.bpmn` is the retained HR/recruitment model from upstream bpmn-js,
carried in `test/fixtures/bpmn/complex.bpmn` in bpmn-xyflow. Its original
Signavio exporter metadata remains intact. The other retained sample files
also originate from that upstream fixture collection.

Retained-source copyright, permission and attribution requirements are included
in `LICENSE.bpmn-io`. The demo renders the unchanged bpmn.io attribution control.
