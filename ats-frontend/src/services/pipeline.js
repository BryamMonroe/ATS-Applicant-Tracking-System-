export const COLUNAS_PIPELINE = [
  {
    status: "APLICADO",
    label: "Aplicado",
    cor: "bg-stone-100 text-stone-600",
    corHeader: "bg-stone-200",
    corPonto: "bg-stone-400",
  },
  {
    status: "TRIAGEM",
    label: "Triagem",
    cor: "bg-blue-50 text-blue-700",
    corHeader: "bg-blue-100",
    corPonto: "bg-blue-400",
  },
  {
    status: "ENTREVISTA",
    label: "Entrevista",
    cor: "bg-violet-50 text-violet-700",
    corHeader: "bg-violet-100",
    corPonto: "bg-violet-400",
  },
  {
    status: "OFERTA",
    label: "Oferta",
    cor: "bg-amber-50 text-amber-700",
    corHeader: "bg-amber-100",
    corPonto: "bg-amber-400",
  },
  {
    status: "APROVADO",
    label: "Aprovado",
    cor: "bg-emerald-50 text-emerald-700",
    corHeader: "bg-emerald-100",
    corPonto: "bg-emerald-400",
  },
  {
    status: "REPROVADO",
    label: "Reprovado",
    cor: "bg-red-50 text-red-600",
    corHeader: "bg-red-100",
    corPonto: "bg-red-400",
  },
];

export const CONFIG_STATUS = Object.fromEntries(
  COLUNAS_PIPELINE.map((c) => [c.status, c]),
);

export const formatarTamanho = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatarData = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
};

export const iniciais = (nome = "") =>
  nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export const corAvatar = (nome = "") => {
  const cores = [
    "bg-accent-100 text-accent-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const hash = nome.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return cores[hash % cores.length];
};
