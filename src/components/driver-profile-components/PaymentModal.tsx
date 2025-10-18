import React, { useMemo, useState } from "react";
import { Modal, Button, Input, Row, Col } from "antd";

interface VehicleInfo {
  name: string;
  perDay: number;
  yearly: number;
}

interface Props {
  visible: boolean;
  // New optional prop: if a specific vehicle object is passed, use its prices.
  vehicle?: VehicleInfo | null;
  // Backwards-compatible: some callers may still pass a vehicle class string.
  vehicleClass?: string | null;
  onClose: () => void;
}

const classRates: Record<string, { perDay: number; yearly: number }> = {
  Normal: { perDay: 1, yearly: 365 },
  Premium: { perDay: 3, yearly: 1095 },
  Luxury: { perDay: 5, yearly: 1825 },
};

// Expanded coupon support at module level so it's stable for hooks
const coupons: Record<string, number> = {
  GOKERAL20: 20,
  GOKERAL30: 30,
  GOKERAL40: 40,
  GOKERAL50: 50,
  GOKERAL70: 70,
};

const PaymentModal: React.FC<Props> = ({ visible, vehicle, vehicleClass, onClose }) => {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Determine the active vehicle/prices. Prefer explicit `vehicle` prop when provided.
  const activeVehicle = useMemo(() => {
    if (vehicle && vehicle.name) {
      return { name: vehicle.name, perDay: vehicle.perDay, yearly: vehicle.yearly };
    }

    const active = (vehicleClass || "Normal") as string;
    const r = classRates[active] || classRates["Normal"];
    return { name: active, perDay: r.perDay, yearly: r.yearly };
  }, [vehicle, vehicleClass]);

  const discountPercent = useMemo(() => {
    if (!appliedCoupon) return 0;
    return coupons[appliedCoupon] || 0;
  }, [appliedCoupon]);

  const discountedYearly = Math.round(activeVehicle.yearly * (1 - discountPercent / 100));

  const handleApply = () => {
    const code = coupon.trim().toUpperCase();
    if (code && coupons[code]) {
      setAppliedCoupon(code);
    } else {
      setAppliedCoupon(null);
      // show simple inline feedback by clearing input
      setCoupon("");
      // In real app, replace with message or toast
      alert("Invalid coupon code");
    }
  };

  return (
    <Modal
      title="Registration Fee"
      open={visible}
      onCancel={onClose}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose}>Close</Button>
          <Button type="primary" onClick={() => { alert('Proceed to payment (integration pending)'); }}>
            Pay ₹{discountedYearly}
          </Button>
        </div>
      }
      width={700}
    >
      <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 320 }}>
              <div style={{ padding: 18, borderRadius: 10, border: "2px solid #1890ff", background: "#f0f7ff" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{activeVehicle.name}</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>₹{activeVehicle.perDay}/day</div>
                <div style={{ fontSize: 14, color: "#666", marginTop: 6 }}>₹{activeVehicle.yearly} yearly</div>
              </div>
            </div>
          </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <Row gutter={12}>
          <Col span={12}>
            <div style={{ padding: 12, border: "1px solid #f0f0f0", borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Yearly Amount</div>
              <div style={{ fontSize: 18, marginTop: 8 }}>₹{activeVehicle.yearly}</div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ padding: 12, border: "1px solid #f0f0f0", borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>After Coupon</div>
              <div style={{ fontSize: 18, marginTop: 8 }}>₹{discountedYearly}</div>
              {discountPercent > 0 && (
                <div style={{ fontSize: 12, color: "#52c41a", marginTop: 6 }}>{discountPercent}% applied</div>
              )}
            </div>
          </Col>
        </Row>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Input
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
