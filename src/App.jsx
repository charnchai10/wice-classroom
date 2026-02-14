import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx'; // เครื่องมืออ่าน Excel
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, BookOpen, Users, Calendar, Calculator, 
  Settings, LogOut, Plus, Search, CheckCircle, XCircle, 
  AlertCircle, Clock, Save, Trash2, Edit, FileSpreadsheet,
  Menu, ChevronRight, ChevronLeft, GraduationCap, UserPlus, Database,
  Flag, ThumbsUp, ThumbsDown, MoreVertical, Lock, Mail, Award, User, Shield, Key, FileText, List, UploadCloud, Users2, AlertTriangle, CheckSquare, Square, Info, Book, PenTool
} from 'lucide-react';

/**
 * =================================================================================================
 * CONFIGURATION & THEME
 * =================================================================================================
 */
const LOGO_URL = "https://i.postimg.cc/CxmgLgc9/wice2567logo-e.png";

/**
 * =================================================================================================
 * MOCK DATA (ข้อมูลจำลอง)
 * =================================================================================================
 */
const INITIAL_COURSES = [
  { 
    id: 1, 
    code: '20204-2001', 
    name: 'หลักการเขียนโปรแกรม', 
    credits: 3, 
    room: '421', 
    level: 'ปวช. 2', 
    term: '1', 
    year: '2567', 
    weights: { knowledge: 40, skill: 40, attitude: 20 } 
  },
  { 
    id: 2, 
    code: '20204-2002', 
    name: 'ระบบฐานข้อมูลเบื้องต้น', 
    credits: 3, 
    room: '422', 
    level: 'ปวช. 2', 
    term: '1', 
    year: '2567', 
    weights: { knowledge: 30, skill: 50, attitude: 20 } 
  },
];

const INITIAL_STUDENTS = [
  { id: '6620901001', name: 'นายสมชาย รักเรียน', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'normal', username: 'student1', password: '123' },
  { id: '6620901002', name: 'นางสาวสมหญิง จริงใจ', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'normal', username: 'student2', password: '123' },
  { id: '6620901003', name: 'นายมานะ อดทน', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'risk', username: 'student3', password: '123' },
  { id: '6620901004', name: 'นางสาวชูใจ ใฝ่ดี', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'normal', username: 'student4', password: '123' },
  { id: '6620901005', name: 'นายปิติ มีทรัพย์', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'normal', username: 'student5', password: '123' },
  { id: '6620901006', name: 'นายกล้าหาญ ชาญชัย', level: 'ปวช. 2', room: '2', department: 'ช่างยนต์', status: 'normal', username: 'student6', password: '123' },
  { id: '6620901007', name: 'นางสาวมีนา มานะ', level: 'ปวช. 2', room: '2', department: 'ช่างยนต์', status: 'normal', username: 'student7', password: '123' },
];

const INITIAL_TEACHERS = [
    { id: 1, name: 'นายชาญชัย แก้วเถิน', email: 'charnchai10@gmail.com', username: 'teacher', password: '123', role: 'teacher' },
    { id: 2, name: 'นางสาวใจดี มีสุข', email: 'jaidee@gmail.com', username: 'teacher2', password: '123', role: 'teacher' }
];

const INITIAL_ASSIGNMENTS = {
  1: [
      { id: 'a1', name: 'สอบกลางภาค', type: 'knowledge', maxScore: 20 }, 
      { id: 'a2', name: 'ใบงานที่ 1', type: 'skill', maxScore: 10 },
      { id: 'a3', name: 'โครงงานกลุ่ม', type: 'skill', maxScore: 20 }
  ],
  2: [
      { id: 'b1', name: 'ออกแบบ ER-Diagram', type: 'skill', maxScore: 20 },
      { id: 'b2', name: 'สอบทฤษฎี', type: 'knowledge', maxScore: 30 }
  ]
};

const INITIAL_SCORES = {
  '6620901001': { 'a1': 15, 'a2': 8, 'a3': 18, 'b1': 18, 'b2': 25 },
  '6620901002': { 'a1': 18, 'a2': 9, 'a3': 19, 'b1': 15, 'b2': 28 },
};

const INITIAL_BEHAVIORS = {
  1: [
      { id: 'beh1', name: 'เข้าเรียนตรงเวลา', type: 'positive', point: 1 }, 
      { id: 'beh2', name: 'แต่งกายเรียบร้อย', type: 'positive', point: 1 }, 
      { id: 'beh3', name: 'ส่งงานล่าช้า', type: 'negative', point: 1 },
      { id: 'beh4', name: 'คุยในเวลาเรียน', type: 'negative', point: 1 }
  ],
  2: [
      { id: 'beh1', name: 'เข้าเรียนตรงเวลา', type: 'positive', point: 1 }, 
      { id: 'beh3', name: 'ส่งงานล่าช้า', type: 'negative', point: 1 }
  ]
};

/**
 * =================================================================================================
 * UTILITY FUNCTIONS
 * =================================================================================================
 */

const calculateGrade = (totalScore, attendancePercent) => {
  if (attendancePercent < 80) return 'ขร.';
  if (totalScore >= 80) return '4';
  if (totalScore >= 75) return '3.5';
  if (totalScore >= 70) return '3';
  if (totalScore >= 65) return '2.5';
  if (totalScore >= 60) return '2';
  if (totalScore >= 55) return '1.5';
  if (totalScore >= 50) return '1';
  return '0';
};

const calculateAttitudeScore = (studentId, behaviors, behaviorRecords, maxAttitudeScore) => {
    const studentRecords = behaviorRecords[studentId] || {};
    const recordedDates = Object.keys(studentRecords);
    const totalDays = recordedDates.length;

    if (totalDays === 0) return maxAttitudeScore; 

    let totalCompliancePercent = 0;
    let topicCount = 0;

    behaviors.forEach(b => {
        topicCount++;
        let count = 0;
        recordedDates.forEach(date => {
            const hasBehavior = studentRecords[date]?.includes(b.id);
            if (b.type === 'positive') {
                if (hasBehavior) count++;
            } else {
                if (!hasBehavior) count++; 
            }
        });
        totalCompliancePercent += (count / totalDays);
    });

    if (topicCount === 0) return maxAttitudeScore;

    const averageCompliance = totalCompliancePercent / topicCount;
    return Math.round(averageCompliance * maxAttitudeScore);
};

// --- COMPONENTS ---

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-xl shadow-xl flex items-center space-x-3 border animate-in slide-in-from-right fade-in duration-300 bg-white ${
      type === 'success' ? 'border-l-4 border-l-green-500 text-green-800' : 
      type === 'error' ? 'border-l-4 border-l-red-500 text-red-800' : 'border-l-4 border-l-blue-500 text-blue-800'
    }`}>
      {type === 'success' ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
      <span className="font-medium text-sm md:text-base">{message}</span>
    </div>
  );
};

const AttendanceCheck = ({ students, date, setDate, attendance, onCheck, onSave, holidays, onToggleHoliday }) => {
  const isHoliday = holidays[date];
  const handleBulkCheck = (status) => { if (isHoliday) return; students.forEach(std => onCheck(std.id, date, status)); };
  
  const statusOptions = [ 
      { val: 'present', label: 'มาเรียน', color: 'bg-green-100 text-green-700 border-green-200', active: 'bg-green-600 text-white border-green-600' }, 
      { val: 'absent', label: 'ขาดเรียน', color: 'bg-red-100 text-red-700 border-red-200', active: 'bg-red-600 text-white border-red-600' }, 
      { val: 'leave', label: 'ลากิจ', color: 'bg-blue-100 text-blue-700 border-blue-200', active: 'bg-blue-600 text-white border-blue-600' }, 
      { val: 'sick', label: 'ลาป่วย', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', active: 'bg-yellow-500 text-white border-yellow-500' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex flex-col md:flex-row gap-6 items-center w-full">
            <div className="relative w-full md:w-auto">
                <label className="text-gray-500 text-xs font-bold uppercase mb-1 block tracking-wider">วันที่เช็คชื่อ</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full" 
                    />
                </div>
            </div>
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => onToggleHoliday(date)}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isHoliday ? 'bg-red-500 border-red-500' : 'border-gray-400 bg-white'}`}>
                    {isHoliday && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                </div>
                <label className={`font-bold cursor-pointer select-none ${isHoliday ? 'text-red-600' : 'text-gray-600'}`}>
                    วันหยุดราชการ
                </label>
            </div>
         </div>
         <div className="flex gap-2 w-full md:w-auto justify-end">
            {!isHoliday && (
                <>
                    <button onClick={() => handleBulkCheck('present')} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200 transition">มาครบ</button>
                    <button onClick={() => handleBulkCheck('absent')} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition">ขาดครบ</button>
                </>
            )}
            <button onClick={onSave} className="flex items-center bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition font-bold"><Save className="w-4 h-4 mr-2"/> บันทึก</button>
         </div>
      </div>

      {isHoliday ? (
          <div className="bg-red-50 border-2 border-dashed border-red-200 p-12 rounded-xl text-center flex flex-col items-center justify-center text-red-600">
              <Calendar className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="font-bold text-xl mb-2">⛔ วันนี้เป็นวันหยุดราชการ</h3>
              <p className="text-red-400">ระบบจะไม่นำวันนี้ไปคำนวณเวลาเรียน</p>
          </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 w-1/3">รหัส / ชื่อ-สกุล</th>
                            <th className="px-6 py-4 text-center">สถานะการมาเรียน</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((std) => {
                            const status = attendance[std.id]?.[date] || '';
                            return (
                                <tr key={std.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-gray-500 text-xs mb-1">{std.id}</div>
                                        <div className="font-bold text-gray-800">{std.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center flex-wrap gap-2">
                                            {statusOptions.map((opt) => (
                                                <button
                                                    key={opt.val}
                                                    onClick={() => onCheck(std.id, date, opt.val)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                                                        status === opt.val 
                                                            ? `${opt.active} shadow-md transform scale-105` 
                                                            : `${opt.color} hover:brightness-95`
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {students.length === 0 && (
                            <tr><td colSpan="2" className="text-center py-10 text-gray-400 font-medium">ยังไม่มีนักเรียนในรายวิชานี้ กรุณาเพิ่มรายชื่อก่อน</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

const ScoreManager = ({ students, course, assignments, scores, onUpdateScore, onAddAssignment, onDeleteAssignment, onSave }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newAssign, setNewAssign] = useState({ name: '', type: 'knowledge', maxScore: 10 });
    const handleAdd = () => { if(!newAssign.name) return; onAddAssignment(course.id, newAssign); setIsAdding(false); setNewAssign({ name: '', type: 'knowledge', maxScore: 10 }); };
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg flex items-center"><Edit className="w-5 h-5 mr-2 text-blue-600" /> บันทึกคะแนนเก็บ</h3>
                    <p className="text-gray-500 text-sm mt-1">คะแนนเจตคติจะถูกคำนวณอัตโนมัติจากส่วนพฤติกรรม</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center font-bold transition"><Plus className="w-4 h-4 mr-2"/> เพิ่มหัวข้อ</button>
                    <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center font-bold transition"><Save className="w-4 h-4 mr-2"/> บันทึกคะแนน</button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-lg animate-in slide-in-from-top-4 relative z-10">
                    <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><XCircle className="w-5 h-5"/></button>
                    <h4 className="font-bold text-blue-800 mb-4 flex items-center"><Plus className="w-5 h-5 mr-2"/> เพิ่มหัวข้อคะแนนใหม่</h4>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-6">
                            <label className="block text-xs font-bold text-gray-600 mb-1">ชื่อหัวข้อ</label>
                            <input type="text" className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" value={newAssign.name} onChange={e => setNewAssign({...newAssign, name: e.target.value})} placeholder="เช่น สอบย่อย 1" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-bold text-gray-600 mb-1">ประเภท</label>
                            <select className="w-full p-2.5 border rounded-lg bg-white cursor-pointer" value={newAssign.type} onChange={e => setNewAssign({...newAssign, type: e.target.value})}>
                                <option value="knowledge">ความรู้ (Knowledge)</option>
                                <option value="skill">ทักษะ (Skill)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-600 mb-1">คะแนนเต็ม</label>
                            <input type="number" className="w-full p-2.5 border rounded-lg bg-white text-center" value={newAssign.maxScore} onChange={e => setNewAssign({...newAssign, maxScore: Number(e.target.value)})} />
                        </div>
                        <div className="md:col-span-1">
                            <button onClick={handleAdd} className="w-full bg-green-600 text-white p-2.5 rounded-lg font-bold shadow hover:bg-green-700 transition">ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-700 text-sm uppercase font-bold">
                            <tr>
                                <th className="px-4 py-4 sticky left-0 bg-gray-50 z-10 border-b min-w-[250px] shadow-sm">ชื่อ-สกุล</th>
                                {['knowledge', 'skill'].map(type => {
                                    const typeAssigns = assignments.filter(a => a.type === type);
                                    if (typeAssigns.length === 0) return null;
                                    return (
                                        <React.Fragment key={type}>
                                            {typeAssigns.map(a => (
                                                <th key={a.id} className="px-2 py-4 text-center border-l min-w-[120px] bg-white group relative">
                                                    <div className={`text-[10px] uppercase tracking-wider mb-1 ${type==='knowledge'?'text-blue-500':'text-orange-500'}`}>{type}</div>
                                                    <div className="text-gray-800 truncate px-2" title={a.name}>{a.name}</div>
                                                    <div className="text-xs text-gray-400 font-normal">({a.maxScore} คะแนน)</div>
                                                    <button 
                                                        onClick={() => onDeleteAssignment(course.id, a.id)} 
                                                        className="absolute top-1 right-1 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1" 
                                                        title="ลบหัวข้อนี้"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </th>
                                            ))}
                                            <th className={`px-2 py-4 text-center border-l border-r min-w-[80px] bg-gray-50 text-${type === 'knowledge' ? 'blue' : 'orange'}-700`}>
                                                รวม {type === 'knowledge' ? 'K' : 'S'}
                                            </th>
                                        </React.Fragment>
                                    );
                                })}
                                <th className="px-4 py-4 text-center bg-gray-100 text-gray-800 sticky right-0 z-10 border-l shadow-sm">รวม<br/>(เต็ม)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map((std) => {
                                let totalScore = 0;
                                return (
                                    <tr key={std.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-700 sticky left-0 bg-white shadow-sm border-r z-10">
                                            <div className="text-xs text-gray-400 mb-0.5">{std.id}</div>
                                            {std.name}
                                        </td>
                                        {['knowledge', 'skill'].map(type => {
                                            const typeAssigns = assignments.filter(a => a.type === type);
                                            if (typeAssigns.length === 0) return null;
                                            let typeTotal = 0;
                                            return (
                                                <React.Fragment key={type}>
                                                    {typeAssigns.map(a => {
                                                        const score = scores[std.id]?.[a.id] || 0;
                                                        typeTotal += Number(score);
                                                        return (
                                                            <td key={a.id} className="px-2 py-3 text-center border-l">
                                                                <input 
                                                                    type="number" 
                                                                    className="w-16 p-1.5 text-center border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-blue-300"
                                                                    value={scores[std.id]?.[a.id] !== undefined ? scores[std.id][a.id] : ''} 
                                                                    placeholder="0" 
                                                                    max={a.maxScore} 
                                                                    onChange={(e) => onUpdateScore(std.id, a.id, e.target.value, a.maxScore)} 
                                                                />
                                                            </td>
                                                        );
                                                    })}
                                                    <td className={`px-2 py-3 text-center font-bold border-l border-r bg-gray-50/50 text-${type === 'knowledge' ? 'blue' : 'orange'}-700`}>{typeTotal}</td>
                                                </React.Fragment>
                                            );
                                        })}
                                        {(() => {
                                            const relevantAssigns = assignments.filter(a => ['knowledge', 'skill'].includes(a.type));
                                            totalScore = relevantAssigns.reduce((sum, a) => sum + Number(scores[std.id]?.[a.id] || 0), 0);
                                        })()}
                                        <td className="px-4 py-3 text-center font-black text-gray-800 bg-gray-100 sticky right-0 border-l shadow-sm z-10">{totalScore}</td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && <tr><td colSpan="100" className="text-center py-10 text-gray-400">ไม่มีนักเรียนในรายวิชานี้</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 4. BehaviorManager
const BehaviorManager = ({ students, course, behaviors, behaviorRecords, onUpdateBehavior, onSave, onUpdateBehaviorsList }) => {
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [newBeh, setNewBeh] = useState({ name: '', type: 'positive', point: 1 });
    const handleAddBehavior = () => { if (!newBeh.name) return; const newId = 'b_' + Date.now(); onUpdateBehaviorsList([...behaviors, { ...newBeh, id: newId }]); setNewBeh({ name: '', type: 'positive', point: 1 }); };
    const handleRemoveBehavior = (id) => { onUpdateBehaviorsList(behaviors.filter(b => b.id !== id)); };
    
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="text-gray-500 text-xs font-bold uppercase mb-1 block">วันที่บันทึก</label>
                        <input type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button onClick={() => setIsConfiguring(!isConfiguring)} className="mt-5 px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 flex items-center"><Settings className="w-4 h-4 mr-2" /> ตั้งค่าหัวข้อ</button>
                </div>
                <button onClick={onSave} className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center font-bold"><Save className="w-4 h-4 mr-2"/> บันทึกพฤติกรรม</button>
            </div>

            {isConfiguring && (
                <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-xl animate-in slide-in-from-top-4 mb-6">
                    <h4 className="font-bold text-blue-800 mb-4 flex items-center"><Flag className="w-5 h-5 mr-2"/> จัดการหัวข้อพฤติกรรม</h4>
                    <div className="flex flex-col md:flex-row gap-3 mb-6 items-end bg-blue-50 p-4 rounded-lg">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-blue-600 mb-1 block">ชื่อพฤติกรรม</label>
                            <input className="w-full p-2 border rounded" value={newBeh.name} onChange={e=>setNewBeh({...newBeh, name:e.target.value})} placeholder="เช่น ช่วยเหลือเพื่อน" />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="text-xs font-bold text-blue-600 mb-1 block">ประเภท</label>
                            <select className="w-full p-2 border rounded" value={newBeh.type} onChange={e=>setNewBeh({...newBeh, type:e.target.value})}>
                                <option value="positive">บวก (+)</option>
                                <option value="negative">ลบ (-)</option>
                            </select>
                        </div>
                        <button onClick={handleAddBehavior} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">เพิ่ม</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {behaviors.map(b => (
                            <div key={b.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 hover:bg-white transition shadow-sm">
                                <div className="flex items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full mr-3 ${b.type === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="font-medium text-gray-700">{b.name}</span>
                                </div>
                                <button onClick={() => handleRemoveBehavior(b.id)} className="text-gray-400 hover:text-red-500 p-1"><XCircle className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 w-1/4">ชื่อ-สกุล</th>
                                {behaviors.map(b => (
                                    <th key={b.id} className="px-2 py-4 text-center min-w-[100px]">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${b.type === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{b.name}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map(std => {
                                const stdRec = behaviorRecords[std.id]?.[currentDate] || [];
                                return (
                                    <tr key={std.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-800">{std.name}</td>
                                        {behaviors.map(b => {
                                            const isChecked = stdRec.includes(b.id);
                                            return (
                                                <td key={b.id} className="px-2 py-3 text-center">
                                                    <button 
                                                        onClick={() => onUpdateBehavior(std.id, currentDate, b.id)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all transform duration-200 ${isChecked ? (b.type === 'positive' ? 'bg-green-500 text-white shadow-md scale-110' : 'bg-red-500 text-white shadow-md scale-110') : 'bg-white border-2 border-gray-200 text-gray-300 hover:border-gray-400'}`}
                                                    >
                                                        {isChecked && <CheckCircle className="w-5 h-5" />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                            {students.length === 0 && <tr><td colSpan="100" className="text-center py-10 text-gray-400">ยังไม่มีนักเรียนในรายวิชานี้</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 5. BehaviorSummary
const BehaviorSummary = ({ students, behaviors, behaviorRecords, maxAttitudeScore }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center text-lg">
                        <Award className="w-6 h-6 mr-2 text-purple-600"/> สรุปพฤติกรรม & คะแนนเจตคติ (เต็ม {maxAttitudeScore})
                    </h3>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm hover:bg-green-700 shadow font-bold"><FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-purple-50 text-purple-900 font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4 text-left rounded-tl-lg">ชื่อ-สกุล</th>
                                {behaviors.map(b => (
                                    <th key={b.id} className="px-2 py-4 text-center">{b.name} (%)</th>
                                ))}
                                <th className="px-6 py-4 text-center bg-purple-100 rounded-tr-lg">คะแนนเจตคติ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50">
                            {students.map(std => {
                                const attitudeScore = calculateAttitudeScore(std.id, behaviors, behaviorRecords, maxAttitudeScore);
                                const studentRecords = behaviorRecords[std.id] || {};
                                const recordedDates = Object.keys(studentRecords);
                                const totalDays = recordedDates.length || 1; 

                                return (
                                    <tr key={std.id} className="hover:bg-purple-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{std.name}</td>
                                        {behaviors.map(b => {
                                            let count = 0;
                                            recordedDates.forEach(date => {
                                                const hasBehavior = studentRecords[date]?.includes(b.id);
                                                if (b.type === 'positive' && hasBehavior) count++;
                                                if (b.type === 'negative' && !hasBehavior) count++;
                                            });
                                            const percent = Math.round((count / totalDays) * 100);
                                            
                                            return (
                                                <td key={b.id} className="px-2 py-4 text-center">
                                                    <div className="flex items-center justify-center flex-col">
                                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                                                            <div 
                                                                className={`h-full rounded-full ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                                style={{ width: `${percent}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-600">{percent}%</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-block bg-purple-100 text-purple-800 px-4 py-1 rounded-full font-bold text-lg">
                                                {attitudeScore}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 6. Admin Dashboard
const AdminDashboard = ({ students, teachers, setStudents, setTeachers, onNotify, setIsImportOpen }) => {
    const [activeTab, setActiveTab] = useState('students');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [userForm, setUserForm] = useState({ username: '', password: '' });
    const [bulkRoom, setBulkRoom] = useState('');
    const [bulkPassword, setBulkPassword] = useState('');

    const handleDeleteStudent = (studentId) => {
        if(confirm('คุณต้องการลบนักเรียนคนนี้ออกจากฐานข้อมูลกลางหรือไม่? (ข้อมูลในทุกรายวิชาจะหายไป)')) {
            setStudents(prev => prev.filter(s => s.id !== studentId));
            onNotify('ลบนักเรียนเรียบร้อยแล้ว', 'success');
        }
    };
    const handleSetUser = (user, type) => { setSelectedUser({ ...user, type }); setUserForm({ username: user.username || '', password: user.password || '' }); setIsUserModalOpen(true); };
    const handleSaveUser = () => {
        if (!userForm.username || !userForm.password) { onNotify('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน', 'error'); return; }
        if (selectedUser.type === 'teacher') { setTeachers(prev => prev.map(t => t.id === selectedUser.id ? { ...t, username: userForm.username, password: userForm.password } : t)); } else { setStudents(prev => prev.map(s => s.id === selectedUser.id ? { ...s, username: userForm.username, password: userForm.password } : s)); }
        onNotify(`บันทึกบัญชีผู้ใช้สำหรับ ${selectedUser.name} สำเร็จ`, 'success'); setIsUserModalOpen(false); setUserForm({ username: '', password: '' });
    };
    const handleBulkSetPassword = () => {
        if (!bulkRoom || !bulkPassword) { onNotify('กรุณาเลือกห้องและกำหนดรหัสผ่าน', 'error'); return; }
        setStudents(prev => prev.map(s => { if (s.room === bulkRoom) { return { ...s, password: bulkPassword, username: s.id }; } return s; }));
        onNotify(`กำหนดรหัสผ่านสำหรับนักเรียนห้อง ${bulkRoom} ทั้งหมดเป็น "${bulkPassword}" สำเร็จ`, 'success'); setBulkRoom(''); setBulkPassword('');
    };
    const rooms = [...new Set(students.map(s => s.room))].sort();

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Shield className="w-8 h-8 mr-2 text-orange-600"/> แผงควบคุมผู้ดูแลระบบ</h2>
            <div className="flex space-x-2 border-b overflow-x-auto"><button className={`px-6 py-3 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'students' ? 'text-blue-600 border-blue-600 bg-blue-50' : 'text-gray-500 border-transparent hover:bg-gray-50'}`} onClick={() => setActiveTab('students')}>ฐานข้อมูลนักเรียน</button><button className={`px-6 py-3 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'teachers_user' ? 'text-blue-600 border-blue-600 bg-blue-50' : 'text-gray-500 border-transparent hover:bg-gray-50'}`} onClick={() => setActiveTab('teachers_user')}>บัญชีผู้ใช้ (ครู)</button><button className={`px-6 py-3 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'students_user' ? 'text-blue-600 border-blue-600 bg-blue-50' : 'text-gray-500 border-transparent hover:bg-gray-50'}`} onClick={() => setActiveTab('students_user')}>บัญชีผู้ใช้ (นักเรียน)</button></div>

            {activeTab === 'students' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between mb-4"><h3 className="font-bold text-lg">รายชื่อนักเรียนทั้งหมด ({students.length})</h3><button onClick={() => setIsImportOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-green-700 font-bold"><FileSpreadsheet className="w-4 h-4 mr-2"/> นำเข้า Excel</button></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 uppercase text-gray-600"><tr><th className="p-3 rounded-tl-lg">รหัส</th><th className="p-3">ชื่อ-สกุล</th><th className="p-3">ระดับชั้น</th><th className="p-3">ห้อง</th><th className="p-3">แผนกวิชา</th><th className="p-3 text-center rounded-tr-lg">จัดการ</th></tr></thead><tbody className="divide-y divide-gray-100">{students.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="p-3 font-mono">{s.id}</td><td className="p-3 font-medium">{s.name}</td><td className="p-3">{s.level}</td><td className="p-3">{s.room}</td><td className="p-3">{s.department || '-'}</td><td className="p-3 text-center"><button onClick={() => handleDeleteStudent(s.id)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50" title="ลบนักเรียน"><Trash2 className="w-5 h-5" /></button></td></tr>))}</tbody></table></div></div>
            )}
            {activeTab === 'teachers_user' && (<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="font-bold text-lg mb-4">จัดการบัญชีครูผู้สอน</h3><table className="w-full text-left"><thead className="bg-gray-50"><tr><th className="p-3">ชื่อ-สกุล</th><th className="p-3">อีเมล</th><th className="p-3">Username</th><th className="p-3 text-right">การจัดการ</th></tr></thead><tbody>{teachers.map(u => (<tr key={u.id} className="border-b"><td className="p-3 font-medium">{u.name}</td><td className="p-3 text-gray-500">{u.email}</td><td className="p-3 font-mono text-blue-600">{u.username}</td><td className="p-3 text-right"><button onClick={() => handleSetUser(u, 'teacher')} className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 font-medium"><Key className="w-4 h-4 inline mr-1"/> ตั้งรหัสผ่าน</button></td></tr>))}</tbody></table></div>)}
            {activeTab === 'students_user' && (<div className="space-y-6"><div className="bg-blue-50 p-6 rounded-xl border border-blue-100"><h3 className="font-bold text-blue-800 mb-4 flex items-center"><Users2 className="w-5 h-5 mr-2"/> กำหนดรหัสผ่านแบบกลุ่ม (รายห้อง)</h3><div className="flex flex-col md:flex-row gap-4 items-end"><div className="w-full md:w-1/3"><label className="text-xs font-bold text-blue-600 block mb-1">เลือกห้องเรียน</label><select className="w-full p-2 border rounded-lg bg-white" value={bulkRoom} onChange={e => setBulkRoom(e.target.value)}><option value="">-- เลือกห้อง --</option>{rooms.map(r => <option key={r} value={r}>ห้อง {r}</option>)}</select></div><div className="w-full md:w-1/3"><label className="text-xs font-bold text-blue-600 block mb-1">กำหนดรหัสผ่านใหม่</label><input type="text" className="w-full p-2 border rounded-lg bg-white" placeholder="เช่น 1234" value={bulkPassword} onChange={e => setBulkPassword(e.target.value)}/></div><button onClick={handleBulkSetPassword} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md w-full md:w-auto">บันทึกให้ทั้งห้อง</button></div></div><div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><h3 className="font-bold text-lg mb-4">รายชื่อนักเรียน (กำหนดรายบุคคล)</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 uppercase text-gray-600"><tr><th className="p-3">รหัส</th><th className="p-3">ชื่อ-สกุล</th><th className="p-3">ห้อง</th><th className="p-3">Username</th><th className="p-3 text-right">การจัดการ</th></tr></thead><tbody className="divide-y divide-gray-100">{students.map(u => (<tr key={u.id} className="border-b hover:bg-gray-50"><td className="p-3 font-mono text-gray-500">{u.id}</td><td className="p-3 font-medium">{u.name}</td><td className="p-3">{u.room}</td><td className="p-3 font-mono text-blue-600">{u.username || '-'}</td><td className="p-3 text-right"><button onClick={() => handleSetUser(u, 'student')} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 font-medium"><Key className="w-4 h-4 inline mr-1"/> ตั้งรหัสผ่าน</button></td></tr>))}</tbody></table></div></div></div>)}
            {isUserModalOpen && selectedUser && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white p-6 rounded-xl shadow-2xl w-96 animate-fade-in"><h3 className="font-bold text-lg mb-4">กำหนดผู้ใช้งาน: {selectedUser.name}</h3><div className="space-y-3 mb-4"><div><label className="text-xs font-bold text-gray-500">ชื่อผู้ใช้งาน (Username)</label><input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} placeholder="ตั้งชื่อผู้ใช้งาน"/></div><div><label className="text-xs font-bold text-gray-500">รหัสผ่าน (Password)</label><input type="password" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="ตั้งรหัสผ่าน"/></div></div><div className="flex justify-end space-x-2"><button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">ยกเลิก</button><button onClick={handleSaveUser} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold">บันทึก</button></div></div></div>)}
        </div>
    );
};

// 7. Teacher Dashboard
const TeacherDashboard = ({ courses, students, assignments, scores, attendance, holidays, enrollments, setEnrollments, onNotify }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const stats = useMemo(() => {
    let targetCourses = courses;
    if (selectedCourseId !== 'all') { targetCourses = courses.filter(c => c.id === Number(selectedCourseId)); }
    const gradeCounts = { '4': 0, '3-3.5': 0, '2-2.5': 0, '0-1.5': 0, 'ขร.': 0 };
    const attendCounts = { '>80%': 0, '<80%': 0 };
    const dailyStats = { present: 0, absent: 0, sick: 0, leave: 0 };
    const studentScores = [];
    const relevantStudents = students.filter(s => { return targetCourses.some(c => { const enrolledIds = enrollments[c.id] || []; return enrolledIds.includes(s.id); }); });
    relevantStudents.forEach(std => {
      let totalCourseScore = 0; let totalAttendancePercent = 0; let courseCount = 0;
      targetCourses.forEach(course => {
          const enrolledIds = enrollments[course.id] || [];
          if (!enrolledIds.includes(std.id)) return;
          const courseAssigns = assignments[course.id] || []; const stdScores = scores[std.id] || {}; let k=0, s=0;
          courseAssigns.forEach(a => { const sc = Number(stdScores[a.id] || 0); if(a.type === 'knowledge') k += sc; if(a.type === 'skill') s += sc; });
          const a = course.weights.attitude; const total = k + s + a;
          const attendRecord = attendance[std.id] || {}; const validDates = Object.keys(attendRecord).filter(date => !holidays[date]);
          const presentCount = validDates.filter(d => attendRecord[d] === 'present' || attendRecord[d] === 'late').length; const totalSessions = validDates.length || 1; 
          const attendPercent = (presentCount / totalSessions) * 100;
          validDates.forEach(d => { const status = attendRecord[d]; if(status === 'present') dailyStats.present++; else if(status === 'absent') dailyStats.absent++; else if(status === 'sick') dailyStats.sick++; else if(status === 'leave') dailyStats.leave++; });
          totalCourseScore += total; totalAttendancePercent += attendPercent; courseCount++;
      });
      if (courseCount > 0) {
        const avgScore = totalCourseScore / courseCount; const avgAttend = totalAttendancePercent / courseCount; const grade = calculateGrade(avgScore, avgAttend);
        if (grade === '4') gradeCounts['4']++; else if (['3', '3.5'].includes(grade)) gradeCounts['3-3.5']++; else if (['2', '2.5'].includes(grade)) gradeCounts['2-2.5']++; else if (grade === 'ขร.') gradeCounts['ขร.']++; else gradeCounts['0-1.5']++;
        if (avgAttend >= 80) attendCounts['>80%']++; else attendCounts['<80%']++;
        studentScores.push({ name: std.name, score: avgScore });
      }
    });
    studentScores.sort((a, b) => b.score - a.score);
    const behaviorData = [{ name: 'ตรงต่อเวลา', score: 85 }, { name: 'แต่งกาย', score: 90 }, { name: 'ส่งงาน', score: 75 }, { name: 'จิตอาสา', score: 80 }];
    return { grades: [{ name: 'เกรด 4', value: gradeCounts['4'], color: '#10B981' }, { name: 'เกรด 3-3.5', value: gradeCounts['3-3.5'], color: '#3B82F6' }, { name: 'เกรด 2-2.5', value: gradeCounts['2-2.5'], color: '#FACC15' }, { name: 'เกรด 0-1.5', value: gradeCounts['0-1.5'], color: '#EF4444' }], attendance: [{ name: 'เวลาเรียน > 80%', value: attendCounts['>80%'], color: '#10B981' }, { name: 'เวลาเรียน < 80%', value: attendCounts['<80%'], color: '#EF4444' }], daily: dailyStats, top5: studentScores.slice(0, 5), bottom5: studentScores.slice(-5).reverse(), behavior: behaviorData };
  }, [selectedCourseId, courses, students, assignments, scores, attendance, holidays, enrollments]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">แดชบอร์ดสรุปผล</h2><div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center"><span className="text-sm font-bold text-gray-600 mr-2">เลือกรายวิชา:</span><select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="border-none outline-none text-sm font-medium text-blue-700 bg-transparent"><option value="all">ทั้งหมด</option>{courses.map(c => <option key={c.id} value={c.id}>{c.code} {c.name}</option>)}</select></div></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500"><h3 className="text-gray-500 text-sm">มาเรียน (สะสม)</h3><p className="text-2xl font-bold text-gray-800">{stats.daily.present}</p></div><div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500"><h3 className="text-gray-500 text-sm">ขาดเรียน (สะสม)</h3><p className="text-2xl font-bold text-gray-800">{stats.daily.absent}</p></div><div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500"><h3 className="text-gray-500 text-sm">ลาป่วย</h3><p className="text-2xl font-bold text-gray-800">{stats.daily.sick}</p></div><div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500"><h3 className="text-gray-500 text-sm">ลากิจ</h3><p className="text-2xl font-bold text-gray-800">{stats.daily.leave}</p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Calculator className="w-5 h-5 mr-2 text-blue-600"/> สรุปเกรด (Pie Chart)</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.grades} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>{stats.grades.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div><div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-green-600"/> สรุปเวลาเรียน (Pie Chart)</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.attendance} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}>{stats.attendance.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Flag className="w-5 h-5 mr-2 text-indigo-600"/> สรุปพฤติกรรม (Bar Chart)</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.behavior}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip cursor={{fill: 'transparent'}} /><Bar dataKey="score" fill="#4F46E5" radius={[5, 5, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer></div></div><div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-lg font-bold text-gray-800 mb-4">คะแนนสูงสุด / ต่ำสุด (เต็ม 100)</h3><div className="space-y-4"><div><h4 className="text-green-600 font-bold flex items-center mb-2"><ThumbsUp className="w-4 h-4 mr-2"/> Top 5</h4>{stats.top5.map((s,i) => (<div key={i} className="flex justify-between text-sm bg-green-50 p-2 rounded mb-1"><span>{i+1}. {s.name}</span><span className="font-bold">{s.score.toFixed(1)}</span></div>))}</div><div><h4 className="text-red-600 font-bold flex items-center mb-2"><ThumbsDown className="w-4 h-4 mr-2"/> Bottom 5</h4>{stats.bottom5.map((s,i) => (<div key={i} className="flex justify-between text-sm bg-red-50 p-2 rounded mb-1"><span>{i+1}. {s.name}</span><span className="font-bold">{s.score.toFixed(1)}</span></div>))}</div></div></div></div>
    </div>
  );
};

// 8. Student Dashboard (Enhanced with details)
const StudentDashboard = ({ studentId, courses, assignments, scores, attendance, holidays }) => {
    // For demo, force using a student ID that exists in mock data if the logged in user is generic
    const sId = studentId === '6620901001' ? studentId : '6620901001'; 

    return (
        <div className="space-y-8 animate-fade-in pb-10 font-sans">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-full"><GraduationCap className="w-8 h-8 text-blue-600" /></div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">ผลการเรียนของฉัน</h2>
                    <p className="text-gray-500 text-sm">ตรวจสอบคะแนนและเวลาเรียนรายวิชา</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {courses.map(course => {
                    const courseAssigns = assignments[course.id] || [];
                    const stdScores = scores[sId] || {};
                    const attendRecord = attendance[sId] || {};
                    const validDates = Object.keys(attendRecord).filter(date => !holidays[date]);
                    
                    // --- 1. Calculate Scores ---
                    let rawK = 0, rawS = 0, maxK = 0, maxS = 0;
                    
                    // Group assignments for display
                    const kAssigns = [], sAssigns = [];

                    courseAssigns.forEach(a => {
                        const sc = Number(stdScores[a.id] || 0);
                        if(a.type === 'knowledge') {
                            rawK += sc; maxK += a.maxScore;
                            kAssigns.push({ ...a, score: sc });
                        }
                        if(a.type === 'skill') {
                            rawS += sc; maxS += a.maxScore;
                            sAssigns.push({ ...a, score: sc });
                        }
                    });

                    // Weighted Calculation
                    const weightedK = maxK > 0 ? (rawK / maxK) * course.weights.knowledge : 0;
                    const weightedS = maxS > 0 ? (rawS / maxS) * course.weights.skill : 0;
                    
                    // Attitude (Mock Logic: Assume max for student view if no behavior records passed)
                    // In real app, pass behaviors/records props to calculate correctly
                    const aScore = course.weights.attitude; 
                    
                    const totalScore = Math.round(weightedK + weightedS + aScore);

                    // --- 2. Calculate Attendance ---
                    const totalSessions = validDates.length || 1; 
                    const presentCount = validDates.filter(d => attendRecord[d] === 'present' || attendRecord[d] === 'late').length;
                    const absentCount = validDates.filter(d => attendRecord[d] === 'absent').length;
                    const attendPercent = Math.round((presentCount / totalSessions) * 100);
                    const grade = calculateGrade(totalScore, attendPercent);

                    return (
                        <div key={course.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            {/* Card Header */}
                            <div className="bg-[#1E3A8A] p-5 text-white flex justify-between items-start">
                                <div>
                                    <span className="inline-block bg-blue-700/50 text-xs px-2 py-1 rounded mb-2 border border-blue-400/30">{course.code}</span>
                                    <h3 className="text-xl font-bold leading-tight">{course.name}</h3>
                                </div>
                                <div className="bg-white/10 p-2 rounded-lg text-center backdrop-blur-sm min-w-[60px]">
                                    <div className="text-xs opacity-80 mb-1">เกรด</div>
                                    <div className={`text-2xl font-black ${grade === '0' || grade === 'ขร.' ? 'text-red-300' : 'text-green-300'}`}>{grade}</div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Score Summary Section */}
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                                        <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">คะแนนรวม</div>
                                        <div className="text-3xl font-black text-green-700">{totalScore}</div>
                                        <div className="text-[10px] text-green-500">เต็ม 100</div>
                                    </div>
                                    <div className="flex-1 bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                                        <div className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">ขาดเรียน</div>
                                        <div className="text-3xl font-black text-red-700">{absentCount}</div>
                                        <div className="text-[10px] text-red-500">ครั้ง</div>
                                    </div>
                                </div>

                                {/* Detailed Scores (Accordions/Lists) */}
                                <div>
                                    <h4 className="font-bold text-gray-700 mb-3 flex items-center text-sm"><FileText className="w-4 h-4 mr-2"/> รายละเอียดคะแนนเก็บ</h4>
                                    <div className="space-y-3">
                                        {/* Knowledge */}
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-blue-50 px-3 py-2 flex justify-between items-center text-xs font-bold text-blue-800">
                                                <span>ด้านความรู้ (เต็ม {course.weights.knowledge})</span>
                                                <span>ได้ {Math.round(weightedK)} คะแนน</span>
                                            </div>
                                            <div className="p-3 bg-white space-y-2">
                                                {kAssigns.length > 0 ? kAssigns.map(a => (
                                                    <div key={a.id} className="flex justify-between text-sm border-b border-dashed border-gray-100 last:border-0 pb-1 last:pb-0">
                                                        <span className="text-gray-600">{a.name}</span>
                                                        <span className={`font-medium ${a.score < a.maxScore/2 ? 'text-red-500' : 'text-gray-800'}`}>
                                                            {a.score} / {a.maxScore}
                                                        </span>
                                                    </div>
                                                )) : <div className="text-xs text-gray-400 italic">ไม่มีรายการคะแนน</div>}
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="bg-orange-50 px-3 py-2 flex justify-between items-center text-xs font-bold text-orange-800">
                                                <span>ด้านทักษะ (เต็ม {course.weights.skill})</span>
                                                <span>ได้ {Math.round(weightedS)} คะแนน</span>
                                            </div>
                                            <div className="p-3 bg-white space-y-2">
                                                {sAssigns.length > 0 ? sAssigns.map(a => (
                                                    <div key={a.id} className="flex justify-between text-sm border-b border-dashed border-gray-100 last:border-0 pb-1 last:pb-0">
                                                        <span className="text-gray-600">{a.name}</span>
                                                        <span className={`font-medium ${a.score < a.maxScore/2 ? 'text-red-500' : 'text-gray-800'}`}>
                                                            {a.score} / {a.maxScore}
                                                        </span>
                                                    </div>
                                                )) : <div className="text-xs text-gray-400 italic">ไม่มีรายการคะแนน</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Attendance Bar */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1 font-bold">
                                        <span className="text-gray-600">เช็คชื่อเข้าเรียน</span>
                                        <span className={attendPercent < 80 ? 'text-red-600' : 'text-green-600'}>{attendPercent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${attendPercent < 80 ? 'bg-red-500' : 'bg-green-500'}`} 
                                            style={{ width: `${attendPercent}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 text-right">เช็คชื่อแล้ว {totalSessions} ครั้ง</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN APP ---
export default function ClassroomApp() {
  const [user, setUser] = useState(null); 
  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: null });
  const [loginError, setLoginError] = useState('');

  const [currentPage, setCurrentPage] = useState('login');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTab, setCourseTab] = useState('students');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Data States
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [scores, setScores] = useState(INITIAL_SCORES);
  const [attendance, setAttendance] = useState({});
  const [holidays, setHolidays] = useState({});
  const [behaviors, setBehaviors] = useState(INITIAL_BEHAVIORS);
  const [behaviorRecords, setBehaviorRecords] = useState({});
  const [enrollments, setEnrollments] = useState({});
  
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterTerm, setFilterTerm] = useState('1');
  const [filterYear, setFilterYear] = useState('2567');
  
  // Modals State
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credits: 3, room: '', term: '1', year: '2567', level: 'ปวช. 2', weights: { knowledge: 40, skill: 40, attitude: 20 } });
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ id: '', name: '', level: '', room: '' });
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [isImportStudentOpen, setIsImportStudentOpen] = useState(false);
  const [importSearch, setImportSearch] = useState({ id: '', name: '', level: '', room: '' });
  const [studentsToImport, setStudentsToImport] = useState([]);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    const initialEnrollments = {};
    courses.forEach(c => { initialEnrollments[c.id] = students.map(s => s.id); });
    setEnrollments(initialEnrollments);
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    if (loginForm.role === 'teacher') {
       // Mock check - in real app, check against teachers array
       const teacher = teachers.find(t => t.username === loginForm.username && t.password === loginForm.password);
       if (teacher) { setUser({ ...teacher, role: 'teacher' }); setCurrentPage('dashboard'); } 
       else if (loginForm.username === 'teacher' && loginForm.password === '123') { setUser({ name: 'นายชาญชัย แก้วเถิน', role: 'teacher' }); setCurrentPage('dashboard'); } // Fallback
       else { setLoginError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'); }
    } else if (loginForm.role === 'admin') {
       if (loginForm.password === '072889604') { setUser({ name: 'ผู้ดูแลระบบ', role: 'admin' }); setCurrentPage('dashboard'); } 
       else { setLoginError('รหัสผ่านไม่ถูกต้อง'); }
    } else if (loginForm.role === 'student') {
       const student = students.find(s => s.username === loginForm.username && s.password === loginForm.password);
       if (student) { setUser({ ...student, role: 'student' }); setCurrentPage('dashboard'); }
       else if (loginForm.username === 'student' && loginForm.password === '123') { setUser({ name: 'นายสมชาย รักเรียน', role: 'student', id: '6620901001' }); setCurrentPage('dashboard'); } // Fallback
       else { setLoginError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'); }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    setSelectedCourse(null);
    setLoginForm({ username: '', password: '', role: null });
  };

  const handleAddCourseSubmit = () => {
    const courseToAdd = { ...newCourse, id: Date.now() };
    setCourses([...courses, courseToAdd]);
    setAssignments({...assignments, [courseToAdd.id]: []});
    setBehaviors({...behaviors, [courseToAdd.id]: [...(behaviors[1] || [])] });
    setEnrollments(prev => ({...prev, [courseToAdd.id]: []}));
    setIsAddCourseOpen(false);
    showNotification('เพิ่มรายวิชาสำเร็จ');
  };

  const handleAddStudentSubmit = () => {
    const studentToAdd = { ...newStudent, status: 'normal' };
    setStudents(prev => [...prev, studentToAdd]);
    setIsAddStudentOpen(false);
    showNotification('เพิ่มนักเรียนเรียบร้อย');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setImportFile(file);
  };

  const handleImportExcel = () => {
    if (!importFile) { showNotification('กรุณาเลือกไฟล์ก่อน', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const newStudents = jsonData.map(row => ({
                id: String(row['รหัสประจำตัว'] || ''), 
                name: row['ชื่อ-นามสกุล'] || '',
                level: row['ระดับชั้น'] || '',
                room: String(row['ห้องเรียน'] || row['ห้องเรียน '] || ''),
                department: row['แผนกวิชา'] || '',
                status: 'normal'
            })).filter(s => s.id && s.name);
            setStudents(prev => {
                const existingIds = new Set(prev.map(s => s.id));
                const uniqueNewStudents = newStudents.filter(s => !existingIds.has(s.id));
                return [...prev, ...uniqueNewStudents];
            });
            showNotification(`นำเข้าข้อมูลนักเรียนสำเร็จ ${newStudents.length} รายการ`, 'success');
            setIsImportExcelOpen(false);
        } catch (error) { console.error(error); showNotification('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error'); }
    };
    reader.readAsArrayBuffer(importFile);
  };

  const handleImportStudentsSubmit = () => {
      setEnrollments(prev => ({ ...prev, [selectedCourse.id]: [...(prev[selectedCourse.id] || []), ...studentsToImport] }));
      showNotification(`เพิ่มนักเรียน ${studentsToImport.length} คน เรียบร้อย`, 'success');
      setIsImportStudentOpen(false);
      setStudentsToImport([]);
  };

  const handleDeleteCourse = (e, id) => {
    e.stopPropagation();
    if (confirm('คุณต้องการลบรายวิชานี้ใช่หรือไม่?')) {
        setCourses(courses.filter(c => c.id !== id));
        showNotification('ลบรายวิชาสำเร็จ', 'error');
    }
  };

  const handleRemoveStudentFromCourse = (courseId, studentId) => {
    if(confirm('ต้องการลบนักเรียนคนนี้ออกจากรายวิชาใช่หรือไม่?')) {
        setEnrollments(prev => ({...prev, [courseId]: prev[courseId].filter(id => id !== studentId)}));
        showNotification('ลบนักเรียนออกจากรายวิชาเรียบร้อย', 'success');
    }
  };

  const handleToggleHoliday = (date) => { setHolidays(prev => ({ ...prev, [date]: !prev[date] })); };
  const handleSaveData = () => { showNotification('บันทึกข้อมูลเรียบร้อยแล้ว'); };
  const handleDeleteAssignment = (courseId, assignId) => { if (confirm('ต้องการลบหัวข้อคะแนนนี้ใช่หรือไม่?')) { const updated = (assignments[courseId] || []).filter(a => a.id !== assignId); setAssignments({ ...assignments, [courseId]: updated }); showNotification('ลบหัวข้อคะแนนเรียบร้อย'); } };
  const onUpdateScore = (sid, aid, val, max) => setScores(p => ({...p, [sid]: {...(p[sid]||{}), [aid]: Math.min(Number(val), max)}}));
  const onAddAssignment = (cid, na) => setAssignments(p => ({...p, [cid]: [...(p[cid]||[]), {...na, id: 'as_'+Date.now()}]}));
  const onUpdateBehaviorsList = (newList) => setBehaviors(prev => ({...prev, [selectedCourse.id]: newList}));
  const onUpdateBehavior = (sid, date, bid) => setBehaviorRecords(prev => { const sRecs = prev[sid] || {}; const dRecs = sRecs[date] || []; const newRecs = dRecs.includes(bid) ? dRecs.filter(i => i!==bid) : [...dRecs, bid]; return {...prev, [sid]: {...sRecs, [date]: newRecs}}; });

  const filteredCourses = courses.filter(c => c.term === filterTerm && c.year === filterYear);
  const filteredStudentsForImport = useMemo(() => {
    if (!selectedCourse) return [];
    const currentEnrolled = enrollments[selectedCourse.id] || [];
    return students.filter(s => {
        if (currentEnrolled.includes(s.id)) return false;
        if (importSearch.id && !s.id.includes(importSearch.id)) return false;
        if (importSearch.name && !s.name.includes(importSearch.name)) return false;
        if (importSearch.level && !s.level.includes(importSearch.level)) return false;
        if (importSearch.room && !s.room.includes(importSearch.room)) return false;
        return true;
    });
  }, [students, enrollments, selectedCourse, importSearch]);
  
  // LOGIC for Select All Filtered Students
  const allFilteredSelected = filteredStudentsForImport.length > 0 && filteredStudentsForImport.every(s => studentsToImport.includes(s.id));
  
  const handleSelectAllFiltered = () => {
      if (allFilteredSelected) {
          // Deselect all filtered
          const filteredIds = filteredStudentsForImport.map(s => s.id);
          setStudentsToImport(prev => prev.filter(id => !filteredIds.includes(id)));
      } else {
          // Select all filtered (add ones not yet selected)
          const filteredIds = filteredStudentsForImport.map(s => s.id);
          setStudentsToImport(prev => [...new Set([...prev, ...filteredIds])]);
      }
  };

  const toggleStudentImportSelection = (id) => {
    setStudentsToImport(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // --- RENDER LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: "'Sarabun', sans-serif" }}>
        {/* Force Load Font Here as well for safety */}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap'); body { font-family: 'Sarabun', sans-serif; }`}</style>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gradient-to-br from-[#1E3A8A] to-blue-900 p-10 flex flex-col justify-center items-center text-white relative">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <img src={LOGO_URL} alt="Logo" className="w-32 h-32 mb-6 drop-shadow-xl animate-pulse-slow" />
             <div className="text-center">
                 <h1 className="text-3xl font-bold mb-2 tracking-wide font-sans text-center w-full">วิทยาลัยการอาชีพ<br/>เวียงเชียงรุ้ง</h1>
                 <p className="text-blue-200 font-sans text-sm tracking-wider uppercase text-center w-full">Classroom Management System</p>
             </div>
          </div>
          <div className="md:w-1/2 p-10 flex flex-col justify-center bg-white font-sans">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">เข้าสู่ระบบ</h2>
            {!loginForm.role ? (
               <div className="space-y-4">
                  {['teacher', 'student', 'admin'].map(r => (
                    <button key={r} onClick={() => setLoginForm({...loginForm, role: r})} className="w-full p-4 border rounded-xl flex items-center hover:bg-blue-50 transition group hover:shadow-md hover:border-blue-200">
                        <div className={`p-3 rounded-lg mr-4 group-hover:text-white transition ${r==='admin'?'bg-orange-100 text-orange-600 group-hover:bg-orange-500': r==='student'?'bg-green-100 text-green-600 group-hover:bg-green-500':'bg-blue-100 text-blue-600 group-hover:bg-blue-500'}`}>
                           {r==='admin'?<Shield className="w-6 h-6"/>:r==='student'?<GraduationCap className="w-6 h-6"/>:<Users className="w-6 h-6"/>}
                        </div>
                        <div className="text-left">
                           <h3 className="font-bold text-gray-800 capitalize">{r === 'teacher' ? 'ครูผู้สอน' : r === 'student' ? 'นักเรียน' : 'ผู้ดูแลระบบ'}</h3>
                           <p className="text-xs text-gray-400">เข้าสู่ระบบสำหรับ {r}</p>
                        </div>
                    </button>
                  ))}
               </div>
            ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                   <button type="button" onClick={() => setLoginForm({...loginForm, role: null})} className="text-sm text-gray-500 flex items-center mb-4 hover:text-blue-600 transition"><ChevronLeft className="w-4 h-4 mr-1"/> เปลี่ยนบทบาท</button>
                   <div className="text-center mb-6">
                       <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${loginForm.role === 'admin' ? 'bg-orange-100 text-orange-700' : loginForm.role === 'student' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                           {loginForm.role}
                       </span>
                   </div>
                   {loginForm.role !== 'admin' && (
                     <>
                       <div><label className="text-sm font-bold text-gray-600 block mb-1">ชื่อผู้ใช้งาน</label><input type="text" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-sans bg-gray-50 focus:bg-white" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} /></div>
                     </>
                   )}
                   <div><label className="text-sm font-bold text-gray-600 block mb-1">รหัสผ่าน</label><input type="password" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-sans bg-gray-50 focus:bg-white" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} /></div>
                   {loginError && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{loginError}</p>}
                   <button type="submit" className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg font-bold hover:bg-blue-800 shadow-lg transition-transform active:scale-95 font-sans mt-2">เข้าสู่ระบบ</button>
                </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LAYOUT ---
  return (
    <div className="flex h-screen bg-[#F3F4F6] overflow-hidden" style={{ fontFamily: "'Sarabun', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');`}</style>
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[#1E3A8A] text-white hidden md:flex flex-col shadow-2xl transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between h-16 bg-blue-900 relative">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
             <img src={LOGO_URL} className="w-10 h-10 bg-white rounded-full p-0.5 shrink-0" />
             {!isSidebarCollapsed && (
               <div className="flex flex-col">
                 <span className="font-bold text-lg leading-none tracking-wide">WICE</span>
                 <span className="text-[10px] text-blue-200 mt-1 whitespace-nowrap">ระบบบริหารจัดการชั้นเรียน</span>
               </div>
             )}
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-6 bg-blue-600 text-white p-1 rounded-full shadow-md hover:bg-blue-500 z-50">
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'หน้าหลัก' },
            ...(user.role === 'teacher' ? [{ id: 'courses', icon: BookOpen, label: 'รายวิชาที่สอน' }] : []),
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setCurrentPage(item.id); setSelectedCourse(null); }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${currentPage === item.id ? 'bg-[#FACC15] text-blue-900 font-bold shadow-lg transform scale-105' : 'text-blue-100 hover:bg-blue-800 hover:pl-5'} ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <item.icon className="w-6 h-6 min-w-[24px]" />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800 bg-blue-900">
           {!isSidebarCollapsed ? (
             <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold shadow-inner shrink-0">{user.name.charAt(0)}</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-blue-300 capitalize">{user.role}</p>
                </div>
             </div>
           ) : (
             <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold mb-4 mx-auto shrink-0">{user.name.charAt(0)}</div>
           )}
           <button onClick={handleLogout} className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 py-2 rounded-lg transition-colors text-sm shadow-md">
             <LogOut className="w-4 h-4" />
             {!isSidebarCollapsed && <span className="ml-2">ออกจากระบบ</span>}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
         <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 border-b border-gray-100">
          <div className="flex items-center md:hidden">
             <Menu className="w-6 h-6 mr-3 text-gray-600" />
             <span className="font-bold text-[#1E3A8A]">WICE</span>
          </div>
          <h2 className="hidden md:block text-xl font-bold text-gray-800">
            {selectedCourse 
              ? `${selectedCourse.code} ${selectedCourse.name}` 
              : user.role === 'admin' ? 'ระบบผู้ดูแลระบบ' 
              : user.role === 'student' ? 'ระบบนักเรียน' 
              : currentPage === 'dashboard' ? 'แดชบอร์ดสรุปผล' : 'จัดการรายวิชา'}
          </h2>
        </header>
         
         <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {/* VIEW: DASHBOARD */}
            {currentPage === 'dashboard' && (
                <div>
                   {user.role === 'admin' && <AdminDashboard students={students} teachers={teachers} setStudents={setStudents} setTeachers={setTeachers} onNotify={showNotification} setIsImportOpen={setIsImportExcelOpen} />}
                   {user.role === 'teacher' && <TeacherDashboard courses={courses} students={students} assignments={assignments} scores={scores} attendance={attendance} holidays={holidays} enrollments={enrollments} setEnrollments={setEnrollments} onNotify={showNotification} />}
                   {user.role === 'student' && <StudentDashboard studentId={user.id} courses={courses} assignments={assignments} scores={scores} attendance={attendance} holidays={holidays} />}
                </div>
            )}

            {/* VIEW: COURSES LIST */}
            {currentPage === 'courses' && !selectedCourse && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex space-x-4">
                           <div className="flex items-center space-x-2"><span className="text-sm font-bold text-gray-600">ภาคเรียน:</span><select value={filterTerm} onChange={e=>setFilterTerm(e.target.value)} className="border rounded p-2 text-sm outline-none"><option>1</option><option>2</option></select></div>
                           <div className="flex items-center space-x-2"><span className="text-sm font-bold text-gray-600">ปีการศึกษา:</span><input value={filterYear} onChange={e=>setFilterYear(e.target.value)} className="border rounded p-2 w-24 text-center text-sm outline-none"/></div>
                        </div>
                        <button onClick={()=>setIsAddCourseOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 flex items-center transition"><Plus className="w-5 h-5 mr-2"/> เพิ่มรายวิชา</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {filteredCourses.map(c => (
                           <div key={c.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border overflow-hidden group relative">
                               <div className="h-2 bg-blue-600"></div>
                               <button onClick={(e)=>handleDeleteCourse(e, c.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                               <div className="p-6">
                                   <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-2">{c.code}</div>
                                   <h3 className="font-bold text-gray-800 text-lg mb-4 line-clamp-2 h-14">{c.name}</h3>
                                   <p className="text-sm text-gray-500 mb-4 flex items-center"><Users className="w-4 h-4 mr-2 text-blue-400"/> {c.room} | {c.credits} หน่วยกิต</p>
                                   <button onClick={()=>{setSelectedCourse(c); setCourseTab('students');}} className="w-full border border-blue-200 text-blue-600 py-2 rounded hover:bg-blue-50">จัดการรายวิชา</button>
                               </div>
                           </div>
                       ))}
                    </div>
                </div>
            )}

            {/* VIEW: SELECTED COURSE (Tabs & Content) */}
            {selectedCourse && (
                <div className="animate-fade-in pb-12">
                    <button onClick={()=>setSelectedCourse(null)} className="mb-4 text-sm text-gray-500 hover:text-blue-600 flex items-center"><ChevronLeft className="w-4 h-4 mr-1"/> กลับหน้ารายวิชา</button>
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden min-h-[600px] flex flex-col">
                        {/* Course Tabs Navigation */}
                        <div className="flex border-b overflow-x-auto bg-gray-50/50">
                           {[
                               { id: 'students', label: 'รายชื่อ', icon: Users },
                               { id: 'attendance', label: 'เวลาเรียน', icon: Clock },
                               { id: 'scores', label: 'คะแนนเก็บ', icon: Edit },
                               { id: 'behavior', label: 'พฤติกรรม', icon: Flag },
                               { id: 'behavior_sum', label: 'สรุปพฤติกรรม', icon: Award },
                               { id: 'summary', label: 'สรุปผล', icon: GraduationCap }
                           ].map(tab => (
                               <button 
                                 key={tab.id}
                                 onClick={() => setCourseTab(tab.id)}
                                 className={`px-6 py-4 flex items-center whitespace-nowrap text-sm font-bold border-b-4 transition-colors ${courseTab === tab.id ? 'border-blue-600 text-blue-800 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                               >
                                   <tab.icon className="w-4 h-4 mr-2"/> {tab.label}
                               </button>
                           ))}
                        </div>
                        
                        {/* Course Content Area - Persistent Wrapper */}
                        <div className="p-6 flex-1 bg-white">
                            {/* 1. Student List Tab */}
                            <div style={{ display: courseTab === 'students' ? 'block' : 'none' }}>
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg text-gray-700">รายชื่อนักเรียน ({students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id)).length})</h3>
                                        <button onClick={()=>setIsImportStudentOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center shadow hover:bg-purple-700"><Database className="w-4 h-4 mr-2"/> ดึงจากฐานข้อมูลกลาง</button>
                                    </div>
                                    <table className="w-full text-left text-sm border rounded hidden md:table">
                                        <thead className="bg-gray-100"><tr><th className="p-3">รหัส</th><th className="p-3">ชื่อ-สกุล</th><th className="p-3 text-center">ระดับชั้น</th><th className="p-3 text-center">ห้อง</th><th className="p-3 text-center">จัดการ</th></tr></thead>
                                        <tbody>
                                            {students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id)).map(s => (
                                                <tr key={s.id} className="border-b">
                                                    <td className="p-3">{s.id}</td>
                                                    <td className="p-3">{s.name}</td>
                                                    <td className="p-3 text-center">{s.level}</td>
                                                    <td className="p-3 text-center">{s.room}</td>
                                                    <td className="p-3 text-center"><button onClick={() => handleRemoveStudentFromCourse(selectedCourse.id, s.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button></td>
                                                </tr>
                                            ))}
                                            {students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id)).length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">ยังไม่มีนักเรียนในรายวิชานี้</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* 2. Attendance Tab */}
                            <div style={{ display: courseTab === 'attendance' ? 'block' : 'none' }}>
                                <AttendanceCheck students={students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id))} date={currentDate} setDate={setCurrentDate} attendance={attendance} onCheck={(sid,d,st)=>setAttendance(p=>({...p, [sid]:{...(p[sid]||{}), [d]:st}}))} onSave={handleSaveData} holidays={holidays} onToggleHoliday={handleToggleHoliday} />
                            </div>

                            {/* 3. Scores Tab */}
                            <div style={{ display: courseTab === 'scores' ? 'block' : 'none' }}>
                                <ScoreManager students={students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id))} course={selectedCourse} assignments={assignments[selectedCourse.id]||[]} scores={scores} onUpdateScore={(sid, aid, v, max) => setScores(p => ({...p, [sid]: {...(p[sid]||{}), [aid]: Math.min(Number(val), max)}}))} onAddAssignment={(cid, na) => setAssignments(p => ({...p, [cid]: [...(p[cid]||[]), {...na, id: 'as_'+Date.now()}]}))} onDeleteAssignment={handleDeleteAssignment} onSave={handleSaveData} />
                            </div>

                            {/* 4. Behavior Tab */}
                            <div style={{ display: courseTab === 'behavior' ? 'block' : 'none' }}>
                                <BehaviorManager students={students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id))} course={selectedCourse} behaviors={behaviors[selectedCourse.id]||[]} behaviorRecords={behaviorRecords} onUpdateBehavior={(sid, date, bid) => setBehaviorRecords(prev => { const sRecs = prev[sid] || {}; const dRecs = sRecs[date] || []; const newRecs = dRecs.includes(bid) ? dRecs.filter(i => i!==bid) : [...dRecs, bid]; return {...prev, [sid]: {...sRecs, [date]: newRecs}}; })} onUpdateBehaviorsList={(newList) => setBehaviors(prev => ({...prev, [selectedCourse.id]: newList}))} onSave={handleSaveData} />
                            </div>

                            {/* 5. Behavior Summary Tab */}
                            <div style={{ display: courseTab === 'behavior_sum' ? 'block' : 'none' }}>
                                <BehaviorSummary students={students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id))} behaviors={behaviors[selectedCourse.id]||[]} behaviorRecords={behaviorRecords} maxAttitudeScore={selectedCourse.weights.attitude} />
                            </div>

                            {/* 6. Summary Tab */}
                            <div style={{ display: courseTab === 'summary' ? 'block' : 'none' }}>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-pink-50 p-6 rounded-xl border border-pink-100">
                                        <div className="text-pink-800">
                                            <h3 className="font-bold text-lg mb-1">สรุปผลการเรียน (Grade Report)</h3>
                                            <div className="text-sm opacity-80">Knowledge {selectedCourse.weights.knowledge}% | Skill {selectedCourse.weights.skill}% | Attitude {selectedCourse.weights.attitude}%</div>
                                        </div>
                                        <button className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-pink-700 flex items-center"><FileSpreadsheet className="w-5 h-5 mr-2" /> Export Excel</button>
                                    </div>
                                    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-600">
                                                <tr>
                                                    <th className="px-4 py-4 border-r">รหัส</th>
                                                    <th className="px-4 py-4 border-r min-w-[150px]">ชื่อ-สกุล</th>
                                                    <th className="px-2 py-4 text-center border-r">เวลาเรียน</th>
                                                    <th className="px-2 py-4 text-center border-r bg-blue-50 text-blue-800">K ({selectedCourse.weights.knowledge})</th>
                                                    <th className="px-2 py-4 text-center border-r bg-orange-50 text-orange-800">S ({selectedCourse.weights.skill})</th>
                                                    <th className="px-2 py-4 text-center border-r bg-green-50 text-green-800">A ({selectedCourse.weights.attitude})</th>
                                                    <th className="px-2 py-4 text-center border-r font-black text-gray-800 bg-gray-100">รวม (100)</th>
                                                    <th className="px-2 py-4 text-center font-black text-white bg-pink-500">เกรด</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id)).map(std => { 
                                                    const stdScores = scores[std.id] || {}; 
                                                    const courseAssigns = assignments[selectedCourse.id] || []; 
                                                    
                                                    // Calculate Raw Scores
                                                    let rawK = 0, rawS = 0;
                                                    let maxK = 0, maxS = 0;

                                                    courseAssigns.forEach(assign => { 
                                                        const sc = Number(stdScores[assign.id] || 0); 
                                                        if(assign.type === 'knowledge') {
                                                            rawK += sc;
                                                            maxK += assign.maxScore;
                                                        }
                                                        if(assign.type === 'skill') {
                                                            rawS += sc;
                                                            maxS += assign.maxScore;
                                                        }
                                                    }); 

                                                    // Weighting Calculation (Banyat Triyang)
                                                    const weightedK = maxK > 0 ? (rawK / maxK) * selectedCourse.weights.knowledge : 0;
                                                    const weightedS = maxS > 0 ? (rawS / maxS) * selectedCourse.weights.skill : 0;

                                                    const a = calculateAttitudeScore(std.id, behaviors[selectedCourse.id] || behaviors[1], behaviorRecords, selectedCourse.weights.attitude); 
                                                    const total = Math.round(weightedK + weightedS + a); 
                                                    const grade = calculateGrade(total, 100); 

                                                    return (
                                                        <tr key={std.id} className="hover:bg-pink-50 transition-colors border-b">
                                                            <td className="px-4 py-3 border-r font-mono text-gray-500">{std.id}</td>
                                                            <td className="px-4 py-3 border-r font-medium">{std.name}</td>
                                                            <td className="px-2 py-3 text-center border-r">100%</td>
                                                            <td className="px-2 py-3 text-center border-r font-bold text-blue-600 bg-blue-50">
                                                                {Math.round(weightedK)} <span className="text-[10px] text-gray-400 font-normal">({rawK}/{maxK})</span>
                                                            </td>
                                                            <td className="px-2 py-3 text-center border-r font-bold text-orange-600 bg-orange-50">
                                                                {Math.round(weightedS)} <span className="text-[10px] text-gray-400 font-normal">({rawS}/{maxS})</span>
                                                            </td>
                                                            <td className="px-2 py-3 text-center border-r font-bold text-green-600 bg-green-50">{a}</td>
                                                            <td className="px-2 py-3 text-center border-r font-black text-gray-800 bg-gray-100 text-lg">{total}</td>
                                                            <td className={`px-2 py-3 text-center font-black text-white ${grade === '0' || grade === 'ขร.' ? 'bg-red-500' : 'bg-green-500'}`}>{grade}</td>
                                                        </tr>
                                                    ) 
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modals */}
            {isAddCourseOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="font-bold text-xl text-gray-800 flex items-center">
                                <BookOpen className="w-6 h-6 mr-2 text-blue-600"/> เพิ่มรายวิชาใหม่
                            </h3>
                            <button onClick={()=>setIsAddCourseOpen(false)} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition">
                                <XCircle className="w-6 h-6"/>
                            </button>
                        </div>
                        
                        <div className="space-y-5">
                            {/* Course Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">รหัสวิชา</label>
                                    <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="เช่น 2000-0001" value={newCourse.code} onChange={e=>setNewCourse({...newCourse, code:e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ชื่อวิชา</label>
                                    <input className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="ชื่อวิชาภาษาไทย" value={newCourse.name} onChange={e=>setNewCourse({...newCourse, name:e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">หน่วยกิต</label>
                                    <input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg text-center" value={newCourse.credits} onChange={e=>setNewCourse({...newCourse, credits:e.target.value})} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">ระดับชั้น/ห้อง</label>
                                    <input className="w-full border border-gray-300 p-2.5 rounded-lg" placeholder="เช่น ปวช. 1/2" value={newCourse.level} onChange={e=>setNewCourse({...newCourse, level:e.target.value})} />
                                </div>
                            </div>

                            {/* Term & Year */}
                            <div className="grid grid-cols-2 gap-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">ภาคเรียน</label>
                                    <select className="w-full border border-blue-200 p-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={newCourse.term} onChange={e=>setNewCourse({...newCourse, term:e.target.value})}>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="Summer">ฤดูร้อน</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-blue-700 uppercase tracking-wider">ปีการศึกษา</label>
                                    <input className="w-full border border-blue-200 p-2 rounded-lg text-center bg-white" placeholder="2567" value={newCourse.year} onChange={e=>setNewCourse({...newCourse, year:e.target.value})} />
                                </div>
                            </div>
                            
                            {/* Weights */}
                             <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center"><Calculator className="w-4 h-4 mr-2 text-gray-500"/> สัดส่วนคะแนน (ต้องรวมได้ 100)</label>
                                <div className="flex gap-3 text-sm">
                                    <div className="flex-1">
                                        <span className="block text-[10px] text-blue-600 font-bold mb-1 uppercase">ความรู้ (K)</span>
                                        <input type="number" className="w-full p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={newCourse.weights.knowledge} onChange={e=>setNewCourse({...newCourse, weights: {...newCourse.weights, knowledge: Number(e.target.value)}})}/>
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-[10px] text-orange-600 font-bold mb-1 uppercase">ทักษะ (S)</span>
                                        <input type="number" className="w-full p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-orange-500 outline-none" value={newCourse.weights.skill} onChange={e=>setNewCourse({...newCourse, weights: {...newCourse.weights, skill: Number(e.target.value)}})}/>
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-[10px] text-green-600 font-bold mb-1 uppercase">เจตคติ (A)</span>
                                        <input type="number" className="w-full p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-green-500 outline-none" value={newCourse.weights.attitude} onChange={e=>setNewCourse({...newCourse, weights: {...newCourse.weights, attitude: Number(e.target.value)}})}/>
                                    </div>
                                </div>
                                <div className="text-right text-xs mt-2 font-medium text-gray-500">
                                    รวม: <span className={(newCourse.weights.knowledge + newCourse.weights.skill + newCourse.weights.attitude) === 100 ? 'text-green-600' : 'text-red-500'}>
                                        {newCourse.weights.knowledge + newCourse.weights.skill + newCourse.weights.attitude}
                                    </span> / 100
                                </div>
                             </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button onClick={()=>setIsAddCourseOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">ยกเลิก</button>
                                <button onClick={handleAddCourseSubmit} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-900/30 transition transform active:scale-95 flex items-center">
                                    <Save className="w-4 h-4 mr-2"/> บันทึกรายวิชา
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isImportStudentOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                     <div className="bg-white p-6 rounded-lg w-[600px] h-[500px] flex flex-col">
                        <h3 className="font-bold text-lg mb-4">ดึงรายชื่อจากฐานข้อมูลกลาง</h3>
                        <div className="text-xs text-gray-500 mb-2 bg-yellow-50 p-2 rounded border border-yellow-100 flex items-center"><Info className="w-4 h-4 mr-1 text-yellow-600"/> ค้นหาและเลือกนักเรียนที่ต้องการนำเข้าสู่รายวิชานี้</div>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                           <input placeholder="รหัส" value={importSearch.id} onChange={e=>setImportSearch({...importSearch, id:e.target.value})} className="border p-1 text-sm rounded"/>
                           <input placeholder="ชื่อ" value={importSearch.name} onChange={e=>setImportSearch({...importSearch, name:e.target.value})} className="border p-1 text-sm rounded"/>
                           <input placeholder="ชั้น" value={importSearch.level} onChange={e=>setImportSearch({...importSearch, level:e.target.value})} className="border p-1 text-sm rounded"/>
                           <input placeholder="ห้อง" value={importSearch.room} onChange={e=>setImportSearch({...importSearch, room:e.target.value})} className="border p-1 text-sm rounded"/>
                        </div>
                        <div className="flex-1 overflow-y-auto border rounded p-2">
                             <table className="w-full text-sm text-left">
                                <thead className="bg-purple-100 text-purple-800 sticky top-0 shadow-sm">
                                    <tr>
                                        <th className="p-3 w-10 text-center cursor-pointer hover:bg-purple-200 select-none" onClick={handleSelectAllFiltered}>
                                           {allFilteredSelected ? <CheckSquare className="w-5 h-5 text-purple-700"/> : <Square className="w-5 h-5 text-purple-400"/>}
                                        </th>
                                        <th className="p-3">รหัส</th>
                                        <th className="p-3">ชื่อ-สกุล</th>
                                        <th className="p-3">ชั้น/ห้อง</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredStudentsForImport.length === 0 ? (
                                        <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">ไม่พบข้อมูลที่ตรงกัน หรือนักเรียนทุกคนถูกเพิ่มไปหมดแล้ว</td></tr>
                                    ) : (
                                        filteredStudentsForImport.map(s => (
                                            <tr key={s.id} className={`hover:bg-purple-50 cursor-pointer transition-colors ${studentsToImport.includes(s.id)?'bg-purple-50':''}`} onClick={()=>toggleStudentImportSelection(s.id)}>
                                                <td className="p-3 text-center">
                                                    {studentsToImport.includes(s.id) ? <CheckSquare className="w-5 h-5 text-purple-600"/> : <Square className="w-5 h-5 text-gray-300"/>}
                                                </td>
                                                <td className="p-3 font-mono text-gray-600">{s.id}</td>
                                                <td className="p-3 font-medium text-gray-800">{s.name}</td>
                                                <td className="p-3 text-gray-500">{s.level} / {s.room}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                             </table>
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <button onClick={()=>setIsImportStudentOpen(false)} className="px-4 py-2 border rounded">ยกเลิก</button>
                            <button onClick={handleImportStudentsSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">นำเข้า ({studentsToImport.length})</button>
                        </div>
                     </div>
                </div>
            )}
            
            {isImportExcelOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="font-bold text-lg mb-4">นำเข้า Excel (Admin)</h3>
                        <div className="mb-4 text-xs text-gray-600 bg-gray-50 p-3 rounded border">
                           <b>รูปแบบไฟล์ที่รองรับ:</b> .xlsx, .xls<br/>
                           <b>คอลัมน์ที่ต้องมี:</b> รหัสประจำตัว, ชื่อ-นามสกุล, ระดับชั้น, ห้องเรียน, แผนกวิชา
                        </div>
                        <input type="file" onChange={handleFileChange} className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        <div className="flex justify-end gap-2">
                            <button onClick={()=>setIsImportExcelOpen(false)} className="px-4 py-2 text-gray-500">ยกเลิก</button>
                            <button onClick={handleImportExcel} className="px-4 py-2 bg-green-600 text-white rounded">ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}

         </div>
      </main>
    </div>
  );
}