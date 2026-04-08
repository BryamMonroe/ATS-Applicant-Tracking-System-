import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useState } from "react";
import { KanbanColuna } from "./KanbanColuna";
import { CandidatoCard } from "./CandidatoCard";
import { COLUNAS_PIPELINE } from "../../services/pipeline";

export function KanbanBoard({
  candidatos,
  onMover,
  onEditar,
  onDeletar,
  onDownload,
}) {
  const [ativo, setAtivo] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // previne drag ao clicar botões
    }),
  );

  const handleDragStart = ({ active }) => {
    const candidato = candidatos.find((c) => c.id === active.id);
    setAtivo(candidato || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setAtivo(null);
    if (!over) return;

    // `over.id` pode ser o ID de uma coluna (status string)
    // ou o ID de um card (number). Precisamos resolver o status destino.
    const statusDestino =
      COLUNAS_PIPELINE.find((c) => c.status === over.id)?.status ??
      candidatos.find((c) => c.id === over.id)?.status;

    if (!statusDestino) return;

    const candidatoAtivo = candidatos.find((c) => c.id === active.id);
    if (candidatoAtivo && candidatoAtivo.status !== statusDestino) {
      onMover(active.id, statusDestino);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUNAS_PIPELINE.map((config) => (
          <KanbanColuna
            key={config.status}
            config={config}
            candidatos={candidatos.filter((c) => c.status === config.status)}
            onEditar={onEditar}
            onDeletar={onDeletar}
            onDownload={onDownload}
          />
        ))}
      </div>

      {/* DragOverlay: renderiza uma cópia "fantasma" do card enquanto arrasta */}
      <DragOverlay>
        {ativo && (
          <div className="rotate-2 scale-105 shadow-modal">
            <CandidatoCard
              candidato={ativo}
              onEditar={() => {}}
              onDeletar={() => {}}
              onDownload={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
