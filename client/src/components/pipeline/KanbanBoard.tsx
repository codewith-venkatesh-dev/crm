import React from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Lead, LeadStatus } from '../../types/crm';
import { SourceBadge } from '../common/Badge';
import { Calendar, Building, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  updatingLeadId?: string | null;
}

const STAGES: { id: LeadStatus; label: string; color: string; dotColor: string }[] = [
  { id: 'NEW', label: 'New Leads', color: 'border-t-blue-500 bg-blue-50/30', dotColor: 'bg-blue-500' },
  {
    id: 'CONTACTED',
    label: 'Contacted',
    color: 'border-t-purple-500 bg-purple-50/30',
    dotColor: 'bg-purple-500',
  },
  {
    id: 'NEGOTIATING',
    label: 'Negotiating',
    color: 'border-t-amber-500 bg-amber-50/30',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'CLOSED',
    label: 'Closed Deals',
    color: 'border-t-emerald-500 bg-emerald-50/30',
    dotColor: 'bg-emerald-500',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onStatusChange, updatingLeadId }) => {
  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    const targetStatus = destination.droppableId as LeadStatus;
    onStatusChange(draggableId, targetStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px] items-start">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.status === stage.id);

          return (
            <div
              key={stage.id}
              className={`flex flex-col rounded-xl border border-slate-200 bg-slate-50/80 shadow-sm border-t-4 ${stage.color} overflow-hidden`}
            >
              {/* Stage Header */}
              <div className="p-4 border-b border-slate-200/80 bg-white/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`} />
                  <h3 className="font-semibold text-slate-800 text-sm">{stage.label}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {stageLeads.length}
                </span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 min-h-[450px] transition-colors space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    {stageLeads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                        <p className="text-xs">No leads in stage</p>
                      </div>
                    ) : (
                      stageLeads.map((lead, index) => {
                        const nextFollowUp = lead.followUps?.find((f) => !f.isCompleted);
                        const isUpdating = updatingLeadId === lead.id;

                        return (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all group ${
                                  snapshot.isDragging ? 'rotate-1 shadow-lg ring-2 ring-indigo-500' : ''
                                } ${isUpdating ? 'pointer-events-none opacity-90' : ''}`}
                              >
                                {isUpdating && (
                                  <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center gap-1.5 z-20 text-indigo-600 font-medium text-xs animate-fade-in">
                                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                    <span className="font-semibold text-slate-700">Updating stage...</span>
                                  </div>
                                )}

                                <div className="flex items-start justify-between mb-2">
                                  <Link
                                    to={`/leads/${lead.id}`}
                                    className="font-semibold text-slate-900 text-sm hover:text-indigo-600 transition-colors line-clamp-1"
                                  >
                                    {lead.name}
                                  </Link>

                                  {/* Accessible Status Move Dropdown */}
                                  <select
                                    value={lead.status}
                                    disabled={isUpdating}
                                    onChange={(e) =>
                                      onStatusChange(lead.id, e.target.value as LeadStatus)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 ml-2 disabled:opacity-50"
                                  >
                                    <option value="NEW">New</option>
                                    <option value="CONTACTED">Contacted</option>
                                    <option value="NEGOTIATING">Negotiating</option>
                                    <option value="CLOSED">Closed</option>
                                    <option value="LOST">Lost</option>
                                  </select>
                                </div>

                                {lead.companyName && (
                                  <div className="flex items-center text-xs text-slate-500 mb-3">
                                    <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                    <span className="truncate">{lead.companyName}</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                                  <SourceBadge source={lead.source} />

                                  <Link
                                    to={`/leads/${lead.id}`}
                                    className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                    title="View Details"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </Link>
                                </div>

                                {nextFollowUp && (
                                  <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 flex items-center text-[11px] text-slate-500">
                                    <Clock className="w-3 h-3 mr-1 text-amber-500 shrink-0" />
                                    <span className="truncate font-medium">
                                      Next:{' '}
                                      {format(new Date(nextFollowUp.dueDate), 'MMM d')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
