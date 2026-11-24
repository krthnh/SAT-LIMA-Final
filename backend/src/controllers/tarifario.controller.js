// ============================================================
// src/controllers/tarifario.controller.js
// Cálculo del derecho de tramitación: 1.5% valor de tasación + S/ 12.00
// ============================================================
export function calcularTasa(valorTasacion) {
  const valor = parseFloat(valorTasacion) || 0;
  if (valor <= 0) return 12.0;
  const monto = (valor * 0.015) + 12.0;
  return Math.round(monto * 100) / 100;
}

// GET /api/tarifario/calcular?valor_tasacion=50000
export async function calcular(req, res, next) {
  try {
    const valor = parseFloat(req.query.valor_tasacion) || 0;
    const monto = calcularTasa(valor);
    const desglose = {
      valor_tasacion: valor,
      tasa_variable: Math.round((valor * 0.015) * 100) / 100,
      tasa_fija: 12.0,
      monto_total: monto
    };
    res.json({ ok: true, desglose });
  } catch (e) {
    next(e);
  }
}
