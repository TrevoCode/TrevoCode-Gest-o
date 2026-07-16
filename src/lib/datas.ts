// Data de negócio SEMPRE no fuso da empresa (America/Sao_Paulo).
// O servidor roda em UTC: depois das 21h de Brasília, new Date().toISOString().slice(0,10)
// já devolve o dia seguinte — fatura ficava "vencida" 3h antes e o filtro de mês virava
// na hora errada (auditoria 16/07/2026). Timestamps absolutos continuam UTC (timestamptz).
const fmtDiaSP = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }) // en-CA = YYYY-MM-DD

export const hojeISO = () => fmtDiaSP.format(new Date())
