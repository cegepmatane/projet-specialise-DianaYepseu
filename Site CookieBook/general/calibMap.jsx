import React from "react";

export default function QuantityPicker({ value, onChange, min = 1, max = 99 }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="qty">
      <button className="icon-btn" onClick={dec} aria-label="Diminuer">
        −
      </button>
      <div className="qty-val">{value}</div>
      <button className="icon-btn" onClick={inc} aria-label="Augmenter">
        +
      </button>
    </div>
  );
}

