import React, { useState, useEffect } from 'react';
import { territorialService, CoverageStats } from '../services/territorial.service';
import { Map, ChevronRight, ChevronDown, CheckCircle2, XCircle, Users, Activity } from 'lucide-react';
import { cn } from '../../../lib/utils';

// Recursive Tree Node component
const TreeNode = ({ node, level, type }: { node: any, level: number, type: string }) => {
  const [expanded, setExpanded] = useState(level < 2);
  
  // Extract children arrays dynamically
  let children: any[] = [];
  let childType = '';
  
  if (node.municipalities) { children = node.municipalities; childType = 'Municipio'; }
  else if (node.zones) { children = node.zones; childType = 'Zona'; }
  else if (node.polling_stations) { children = node.polling_stations; childType = 'Puesto'; }
  else if (node.polling_tables) { children = node.polling_tables; childType = 'Mesa'; }

  const hasChildren = children.length > 0;
  const assignments = node.team_assignments || [];

  return (
    <div className="w-full">
      <div 
        className={cn("flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer", level === 0 && "bg-slate-50 font-medium")}
        style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (expanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />) : <span className="w-[18px]"></span>}
          <span className="text-xs font-bold text-slate-400 uppercase w-20">{type}</span>
          <span className="text-slate-800">{node.name || `Mesa ${node.table_number}`}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {assignments.length > 0 && (
            <div className="flex -space-x-2">
              {assignments.map((a: any) => (
                <div key={a.id} className="w-6 h-6 rounded-full bg-primary/20 border border-white flex items-center justify-center text-[10px] font-bold text-primary" title={`${a.member.first_name} - ${a.position.name}`}>
                  {a.member.first_name.charAt(0)}{a.member.last_name.charAt(0)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="w-full">
          {children.map((child: any) => (
            <TreeNode key={child.id} node={child} level={level + 1} type={childType} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TerritorialDashboard = () => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [coverage, setCoverage] = useState<CoverageStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [tree, cov] = await Promise.all([
        territorialService.getTree(),
        territorialService.getCoverage()
      ]);
      setTreeData(tree);
      setCoverage(cov);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando inteligencia territorial...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">Inteligencia Territorial</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Mesas Cubiertas</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-bold text-slate-800">{coverage?.covered_tables}</h3>
            <CheckCircle2 size={24} className="text-success" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Mesas Desprotegidas</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-bold text-slate-800">{coverage?.uncovered_tables}</h3>
            <XCircle size={24} className="text-destructive" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Mesas Físicas</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-bold text-slate-800">{coverage?.total_tables}</h3>
            <Activity size={24} className="text-primary" />
          </div>
        </div>
        <div className="bg-primary p-6 rounded-xl border border-primary shadow-sm text-white">
          <p className="text-sm font-medium text-primary-foreground/80">Cobertura Total</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-3xl font-bold">{coverage?.percentage}%</h3>
            <Map size={24} className="text-white" />
          </div>
          <div className="w-full bg-primary-foreground/20 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-white h-full" style={{ width: `${coverage?.percentage}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Map size={18} className="text-primary" /> Árbol Geopolítico y Responsables
          </h2>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {treeData.map(dept => (
            <TreeNode key={dept.id} node={dept} level={0} type="Depto" />
          ))}
          {treeData.length === 0 && (
            <div className="p-8 text-center text-slate-500">No hay estructura territorial creada</div>
          )}
        </div>
      </div>
    </div>
  );
};
