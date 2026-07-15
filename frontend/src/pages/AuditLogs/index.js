import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row, Nav, NavItem, NavLink, Input, Label, Alert } from "reactstrap";
import classnames from "classnames";
import { toast } from "react-toastify";

import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import { getAuditLogs } from "../../helpers/backend_helper";

const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "custom", label: "Custom" },
];

const toDateStr = (d) => d.toISOString().slice(0, 10);

const AuditLogs = () => {
  document.title = "Audit Logs | RMS";
  const [datePreset, setDatePreset] = useState("last30");
  const [customFrom, setCustomFrom] = useState(toDateStr(new Date(Date.now() - 30 * 86400000)));
  const [customTo, setCustomTo] = useState(toDateStr(new Date()));
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const { from, to } = useMemo(() => {
    const now = new Date();
    if (datePreset === "today") return { from: toDateStr(now), to: toDateStr(now) };
    if (datePreset === "last7") return { from: toDateStr(new Date(now - 7 * 86400000)), to: toDateStr(now) };
    if (datePreset === "last30") return { from: toDateStr(new Date(now - 30 * 86400000)), to: toDateStr(now) };
    return { from: customFrom, to: customTo };
  }, [datePreset, customFrom, customTo]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAuditLogs({ from, to })
      .then((res) => {
        if (!cancelled) setLogs(res.logs || []);
      })
      .catch((e) => {
        if (!cancelled) toast.error(typeof e === "string" ? e : "Failed to load audit logs", { autoClose: 3000 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const columns = useMemo(
    () => [
      {
        header: "Date/Time",
        accessorKey: "createdAt",
        enableColumnFilter: false,
        cell: (cell) => new Date(cell.getValue()).toLocaleString(),
      },
      {
        header: "Employee",
        id: "employee",
        enableColumnFilter: false,
        cell: (cell) => cell.row.original.employee?.name || "—",
      },
      { header: "Action", accessorKey: "action", enableColumnFilter: false },
      {
        header: "Entity",
        id: "entity",
        enableColumnFilter: false,
        cell: (cell) => `${cell.row.original.entityType} #${cell.row.original.entityId}`,
      },
      {
        header: "Details",
        accessorKey: "details",
        enableColumnFilter: false,
        cell: (cell) => cell.getValue() || "—",
      },
    ],
    []
  );

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Audit Logs" pageTitle="Operations" />

        <Alert color="info" fade={false}>
          <i className="ri-information-line align-bottom me-1"></i>
          Currently only order refunds are logged. Other changes (menu, tables, inventory, employees) aren't tracked yet.
        </Alert>

        <Row className="mb-3">
          <Col>
            <Nav pills>
              {DATE_PRESETS.map((preset) => (
                <NavItem key={preset.key}>
                  <NavLink
                    href="#"
                    className={classnames({ active: datePreset === preset.key })}
                    onClick={() => setDatePreset(preset.key)}
                  >
                    {preset.label}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            {datePreset === "custom" ? (
              <div className="d-flex gap-2 align-items-center mt-2">
                <Label className="mb-0 fs-13 text-muted">From</Label>
                <Input type="date" style={{ width: 170 }} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                <Label className="mb-0 fs-13 text-muted">To</Label>
                <Input type="date" style={{ width: 170 }} value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            ) : null}
          </Col>
        </Row>

        {loading ? <p className="text-muted">Loading audit logs&hellip;</p> : null}

        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Log Entries</h5>
              </CardHeader>
              <CardBody>
                <TableContainer
                  columns={columns}
                  data={logs}
                  isGlobalFilter={true}
                  customPageSize={10}
                  divClass="table-responsive table-card"
                  tableClass="align-middle table-nowrap"
                  theadClass="table-light"
                  SearchPlaceholder="Search audit logs..."
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuditLogs;
