import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx'; // เครื่องมืออ่าน Excel
import { createClient } from '@supabase/supabase-js'; // เชื่อมต่อฐานข้อมูล
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, BookOpen, Users, Calendar, Calculator, 
  Settings, LogOut, Plus, Search, CheckCircle, XCircle, 
  AlertCircle, Clock, Save, Trash2, Edit, FileSpreadsheet,
  Menu, ChevronRight, ChevronLeft, GraduationCap, UserPlus, Database,
  Flag, ThumbsUp, ThumbsDown, MoreVertical, Lock, Mail, Award, User, Shield, Key, FileText, List, UploadCloud, Users2, AlertTriangle, CheckSquare, Square, Info, Book, PenTool, Layers, Loader2, Filter
} from 'lucide-react';

/**
 * =================================================================================================
 * DATABASE CONNECTION & CONFIGURATION
 * =================================================================================================
 */

// การตั้งค่า Supabase (ดึงจาก .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// การตั้งค่าธีมและโลโก้
const THEME = {
  primary: '#1E3A8A', // Blue
  secondary: '#1E40AF',
  accent: '#FACC15', // Gold
  bg: '#F3F4F6',
  text: '#1F2937',
  font: "'Sarabun', sans-serif",
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6'
};

const LOGO_URL = "https://i.postimg.cc/CxmgLgc9/wice2567logo-e.png";

/**
 * =================================================================================================
 * UTILITY FUNCTIONS (ฟังก์ชันช่วยคำนวณและจัดการข้อมูล)
 * =================================================================================================
 */

// คำนวณเกรดจากคะแนนรวม
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

// คำนวณคะแนนเจตคติจากประวัติพฤติกรรม
// studentId: รหัสนักเรียน
// behaviors: รายการพฤติกรรมทั้งหมดของวิชานั้น
// behaviorRecords: ประวัติการเช็คพฤติกรรมทั้งหมด { date: [behaviorIds] }
// maxAttitudeScore: คะแนนเต็มจิตพิสัย
const calculateAttitudeScore = (studentId, behaviors, behaviorRecords, maxAttitudeScore) => {
    // ดึงประวัติเฉพาะของนักเรียนคนนี้จาก Props ที่ส่งมา (ในรูปแบบ Object หรือ Array)
    const studentRecs = behaviorRecords[studentId] || {};
    const recordedDates = Object.keys(studentRecs);
    const totalDays = recordedDates.length;

    if (totalDays === 0) return maxAttitudeScore; // ยังไม่มีการบันทึก ให้คะแนนเต็มไปก่อน

    let totalCompliancePercent = 0;
    let topicCount = 0;

    behaviors.forEach(b => {
        topicCount++;
        let count = 0;
        
        recordedDates.forEach(date => {
            const hasBehavior = studentRecs[date]?.includes(b.id);
            if (b.type === 'positive') {
                // พฤติกรรมบวก: มีบันทึก = ได้คะแนน
                if (hasBehavior) count++;
            } else {
                // พฤติกรรมลบ: ไม่มีบันทึก = ได้คะแนน (เพราะไม่ได้ทำผิด)
                if (!hasBehavior) count++; 
            }
        });
        
        // คำนวณ % ของหัวข้อนี้
        totalCompliancePercent += (count / totalDays);
    });

    if (topicCount === 0) return maxAttitudeScore;

    // หาค่าเฉลี่ยเปอร์เซ็นต์ความดี * คะแนนเต็ม
    const averageCompliance = totalCompliancePercent / topicCount;
    return Math.round(averageCompliance * maxAttitudeScore);
};

// แปลงวันที่ให้เป็นรูปแบบไทย
const formatDateThai = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
    });
};

/**
 * =================================================================================================
 * UI COMPONENTS (ส่วนประกอบหน้าจอที่ใช้ซ้ำ)
 * =================================================================================================
 */

// 1. Notification Toast
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const bgClass = type === 'success' ? 'bg-green-100 border-green-200 text-green-800' :
                  type === 'error' ? 'bg-red-100 border-red-200 text-red-800' :
                  'bg-blue-100 border-blue-200 text-blue-800';
  
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;

  return (
    <div className={`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-xl shadow-xl flex items-center space-x-3 border animate-in slide-in-from-right fade-in duration-300 ${bgClass}`}>
      <Icon className="w-6 h-6" />
      <div>
         <h4 className="font-bold text-sm">{type === 'success' ? 'สำเร็จ' : type === 'error' ? 'ผิดพลาด' : 'แจ้งเตือน'}</h4>
         <span className="text-sm">{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
          <XCircle className="w-5 h-5"/>
      </button>
    </div>
  );
};

// 2. Loading Spinner Overlay
const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-xl">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-2"/>
        <span className="text-sm font-medium text-blue-800 animate-pulse">กำลังประมวลผลข้อมูล...</span>
    </div>
);

// 3. Modal Wrapper
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl'
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100`}>
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-xl text-gray-800 flex items-center">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                        <XCircle className="w-6 h-6"/>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar relative">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * =================================================================================================
 * FEATURE COMPONENTS (ส่วนทำงานหลัก)
 * =================================================================================================
 */

// 1. Attendance Check (เช็คชื่อ)
const AttendanceCheck = ({ courseId, students, onNotify }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: status }
  const [isHoliday, setIsHoliday] = useState(false);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลการเช็คชื่อจาก DB
  const fetchAttendance = useCallback(async () => {
      setLoading(true);
      try {
          const { data, error } = await supabase
              .from('attendance')
              .select('*')
              .eq('course_id', courseId)
              .eq('date', date);

          if (error) throw error;

          const map = {};
          let holidayFlag = false;

          // เช็คว่ามีสถานะ 'holiday' หรือไม่
          if (data.some(r => r.status === 'holiday')) {
              holidayFlag = true;
          }

          data.forEach(r => {
              if (r.student_id !== 'HOLIDAY_MARKER') map[r.student_id] = r.status;
          });

          setAttendanceData(map);
          setIsHoliday(holidayFlag);

      } catch (err) {
          console.error("Error fetching attendance:", err);
          onNotify("ไม่สามารถโหลดข้อมูลเวลาเรียนได้", "error");
      } finally {
          setLoading(false);
      }
  }, [courseId, date, onNotify]);

  useEffect(() => {
      fetchAttendance();
  }, [fetchAttendance]);

  // บันทึกข้อมูลลง DB
  const handleSave = async () => {
      setLoading(true);
      try {
          // ลบข้อมูลเก่าของวันนี้ออกก่อน เพื่อเขียนทับ
          await supabase.from('attendance').delete().eq('course_id', courseId).eq('date', date);

          const insertData = [];
          
          if (isHoliday) {
              students.forEach(s => {
                  insertData.push({
                      course_id: courseId,
                      student_id: s.id,
                      date: date,
                      status: 'holiday'
                  });
              });
          } else {
               Object.keys(attendanceData).forEach(studentId => {
                   if (attendanceData[studentId]) { // บันทึกเฉพาะที่มีค่า
                       insertData.push({
                           course_id: courseId,
                           student_id: studentId,
                           date: date,
                           status: attendanceData[studentId]
                       });
                   }
               });
          }

          if (insertData.length > 0) {
              const { error } = await supabase.from('attendance').insert(insertData);
              if (error) throw error;
          }

          onNotify('บันทึกเวลาเรียนเรียบร้อยแล้ว', 'success');
      } catch (err) {
          console.error(err);
          onNotify('เกิดข้อผิดพลาดในการบันทึก: ' + err.message, 'error');
      } finally {
          setLoading(false);
      }
  };

  const handleBulkCheck = (status) => {
      const newMap = {};
      students.forEach(s => newMap[s.id] = status);
      setAttendanceData(newMap);
  };

  const toggleStatus = (studentId, status) => {
      setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const statusOptions = [ 
      { val: 'present', label: 'มา', color: 'bg-green-100 text-green-700', active: 'bg-green-600 text-white' }, 
      { val: 'absent', label: 'ขาด', color: 'bg-red-100 text-red-700', active: 'bg-red-600 text-white' }, 
      { val: 'leave', label: 'ลากิจ', color: 'bg-blue-100 text-blue-700', active: 'bg-blue-600 text-white' }, 
      { val: 'sick', label: 'ป่วย', color: 'bg-yellow-100 text-yellow-700', active: 'bg-yellow-500 text-white' }
  ];

  return (
    <div className="space-y-6 relative">
       {loading && <LoadingOverlay />}
       <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Calendar size={16}/></div>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full bg-gray-50" />
              </div>
              <div className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-4 py-2 rounded-lg border hover:bg-gray-100 transition" onClick={() => setIsHoliday(!isHoliday)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isHoliday ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                      {isHoliday && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={isHoliday ? 'text-red-600 font-bold' : 'text-gray-600'}>วันหยุดราชการ</span>
              </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
             {!isHoliday && (
                 <>
                    <button onClick={() => handleBulkCheck('present')} className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-bold hover:bg-green-200 transition">มาครบ</button>
                    <button onClick={() => handleBulkCheck('absent')} className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-bold hover:bg-red-200 transition">ขาดครบ</button>
                 </>
             )}
             <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center font-bold transition transform active:scale-95">
                <Save className="w-4 h-4 mr-2"/> บันทึก
             </button>
          </div>
       </div>

       {isHoliday ? (
           <div className="bg-red-50 border-2 border-dashed border-red-200 p-12 rounded-xl text-center text-red-600 animate-in fade-in zoom-in-95">
               <Calendar className="w-16 h-16 mx-auto mb-3 opacity-20"/>
               <h3 className="text-xl font-bold">วันนี้เป็นวันหยุดราชการ</h3>
               <p className="text-sm opacity-75">ระบบจะไม่นำไปคำนวณเวลาเรียนในวันนี้</p>
           </div>
       ) : (
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="overflow-x-auto">
                   <table className="w-full text-left">
                       <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b">
                           <tr>
                               <th className="px-6 py-4 w-1/3">รหัส / ชื่อ-สกุล</th>
                               <th className="px-6 py-4 text-center">สถานะ</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                           {students.map(s => (
                               <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                                   <td className="px-6 py-3">
                                       <div className="font-mono text-xs text-gray-400 mb-0.5">{s.id}</div>
                                       <div className="font-medium text-gray-800">{s.name}</div>
                                   </td>
                                   <td className="px-6 py-3 text-center">
                                       <div className="flex justify-center gap-2">
                                           {statusOptions.map(opt => (
                                               <button 
                                                 key={opt.val} 
                                                 onClick={() => toggleStatus(s.id, opt.val)}
                                                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${attendanceData[s.id] === opt.val ? opt.active + ' shadow-md scale-105 ring-2 ring-offset-1 ring-blue-100' : opt.color + ' opacity-60 hover:opacity-100'}`}
                                               >
                                                   {opt.label}
                                               </button>
                                           ))}
                                       </div>
                                   </td>
                               </tr>
                           ))}
                           {students.length === 0 && <tr><td colSpan="2" className="p-10 text-center text-gray-400">ยังไม่มีนักเรียนในรายวิชานี้</td></tr>}
                       </tbody>
                   </table>
               </div>
           </div>
       )}
    </div>
  );
};

// 2. Score Manager (จัดการคะแนน)
const ScoreManager = ({ courseId, students, onNotify }) => {
    const [assignments, setAssignments] = useState([]);
    const [scores, setScores] = useState({}); // { studentId: { assignmentId: score } }
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newAssign, setNewAssign] = useState({ name: '', type: 'knowledge', max_score: 10 });

    const fetchScoresData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Assignments
            const { data: assignData } = await supabase.from('assignments').select('*').eq('course_id', courseId).order('created_at', { ascending: true });
            if (assignData) setAssignments(assignData);

            // Fetch Scores
            const { data: scoreData } = await supabase.from('scores').select('*')
                .in('assignment_id', (assignData || []).map(a => a.id));
            
            const scoreMap = {};
            if (scoreData) {
                scoreData.forEach(s => {
                    if (!scoreMap[s.student_id]) scoreMap[s.student_id] = {};
                    scoreMap[s.student_id][s.assignment_id] = s.score;
                });
            }
            setScores(scoreMap);
        } catch (err) {
            console.error("Error fetching scores:", err);
            onNotify('โหลดคะแนนไม่สำเร็จ', 'error');
        } finally {
            setLoading(false);
        }
    }, [courseId, onNotify]);

    useEffect(() => { fetchScoresData(); }, [fetchScoresData]);

    const handleAddAssignment = async () => {
        if (!newAssign.name) return;
        try {
            const { error } = await supabase.from('assignments').insert([{ 
                course_id: courseId,
                name: newAssign.name,
                type: newAssign.type,
                max_score: newAssign.max_score
            }]);
            
            if (error) throw error;
            onNotify('เพิ่มหัวข้อคะแนนสำเร็จ', 'success');
            setIsAdding(false);
            setNewAssign({ name: '', type: 'knowledge', max_score: 10 });
            fetchScoresData(); // Refresh list
        } catch (err) {
            onNotify('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!confirm('ยืนยันลบหัวข้อนี้? คะแนนทั้งหมดในหัวข้อนี้จะหายไป')) return;
        try {
            const { error } = await supabase.from('assignments').delete().eq('id', id);
            if (error) throw error;
            onNotify('ลบหัวข้อสำเร็จ', 'success');
            setAssignments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            onNotify('ลบไม่สำเร็จ', 'error');
        }
    };

    const handleScoreChange = (studentId, assignmentId, value, max) => {
        let val = parseFloat(value);
        if (isNaN(val) || val < 0) val = 0;
        if (val > max) val = max;
        
        setScores(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [assignmentId]: val }
        }));
    };

    const handleSaveScores = async () => {
        setLoading(true);
        try {
            const upsertData = [];
            students.forEach(s => {
                assignments.forEach(a => {
                    const score = scores[s.id]?.[a.id];
                    if (score !== undefined) {
                        upsertData.push({
                            student_id: s.id,
                            assignment_id: a.id,
                            score: score
                        });
                    }
                });
            });
            
            if (upsertData.length > 0) {
                 const { error } = await supabase.from('scores').upsert(upsertData, { onConflict: 'student_id, assignment_id' });
                 if (error) throw error;
            }
            onNotify('บันทึกคะแนนเรียบร้อย', 'success');
        } catch (err) {
            console.error(err);
            onNotify('บันทึกไม่สำเร็จ: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            {loading && <LoadingOverlay />}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg flex items-center"><Edit className="w-5 h-5 mr-2 text-blue-600"/> บันทึกคะแนนเก็บ</h3>
                    <p className="text-gray-500 text-sm mt-1">คะแนนเจตคติจะถูกคำนวณอัตโนมัติจากส่วนพฤติกรรม</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={()=>setIsAdding(!isAdding)} className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-bold text-sm flex items-center transition"><Plus className="w-4 h-4 mr-2"/> เพิ่มหัวข้อ</button>
                    <button onClick={handleSaveScores} className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-bold text-sm flex items-center transition"><Save className="w-4 h-4 mr-2"/> บันทึกคะแนน</button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 animate-in slide-in-from-top-2">
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-blue-800 block mb-1">ชื่อหัวข้อ</label>
                            <input className="w-full p-2 border rounded shadow-sm" value={newAssign.name} onChange={e=>setNewAssign({...newAssign, name:e.target.value})} placeholder="เช่น สอบย่อย 1"/>
                        </div>
                        <div className="w-full md:w-40">
                            <label className="text-xs font-bold text-blue-800 block mb-1">ประเภท</label>
                            <select className="w-full p-2 border rounded shadow-sm" value={newAssign.type} onChange={e=>setNewAssign({...newAssign, type:e.target.value})}>
                                <option value="knowledge">ความรู้ (K)</option>
                                <option value="skill">ทักษะ (S)</option>
                            </select>
                        </div>
                        <div className="w-full md:w-24">
                            <label className="text-xs font-bold text-blue-800 block mb-1">คะแนนเต็ม</label>
                            <input type="number" className="w-full p-2 border rounded shadow-sm text-center" value={newAssign.max_score} onChange={e=>setNewAssign({...newAssign, max_score:e.target.value})}/>
                        </div>
                        <button onClick={handleAddAssignment} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-sm w-full md:w-auto">ยืนยัน</button>
                        <button onClick={()=>setIsAdding(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded w-full md:w-auto">ยกเลิก</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-700 text-sm font-bold">
                            <tr>
                                <th className="p-4 sticky left-0 bg-gray-50 z-10 border-b min-w-[200px]">นักเรียน</th>
                                {assignments.map(a => (
                                    <th key={a.id} className="p-4 text-center border-l min-w-[120px] group relative bg-white border-b hover:bg-gray-50">
                                        <div className={`text-[10px] uppercase font-extrabold tracking-wider ${a.type==='knowledge'?'text-blue-600':'text-orange-600'}`}>{a.type}</div>
                                        <div className="truncate w-full font-medium" title={a.name}>{a.name}</div>
                                        <div className="text-xs text-gray-400">({a.max_score} คะแนน)</div>
                                        <button onClick={()=>handleDeleteAssignment(a.id)} className="absolute top-1 right-1 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"><XCircle className="w-4 h-4"/></button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map(s => (
                                <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="p-4 sticky left-0 bg-white border-r z-10 shadow-sm">
                                        <div className="text-xs text-gray-400 font-mono mb-0.5">{s.id}</div>
                                        <div className="font-medium text-gray-900">{s.name}</div>
                                    </td>
                                    {assignments.map(a => (
                                        <td key={a.id} className="p-2 border-l text-center">
                                            <input 
                                                type="number" 
                                                className="w-full p-2 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-blue-300 bg-gray-50/50 focus:bg-white"
                                                value={scores[s.id]?.[a.id] ?? ''}
                                                onChange={e => handleScoreChange(s.id, a.id, e.target.value, a.max_score)}
                                                placeholder="-"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {students.length === 0 && <tr><td colSpan="100" className="p-10 text-center text-gray-400">ยังไม่มีนักเรียนในรายวิชานี้</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// 3. Behavior Manager (จัดการพฤติกรรม)
const BehaviorManager = ({ courseId, students, onNotify }) => {
    // ... Similar logic to ScoreManager but for behaviors table ...
    // For brevity in this response, implementing core logic
    const [behaviors, setBehaviors] = useState([]);
    const [records, setRecords] = useState({}); // { studentId: { date: [behaviorIds] } }
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [newBeh, setNewBeh] = useState({ name: '', type: 'positive' });
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
         setLoading(true);
         // Fetch Behaviors
         const { data: behData } = await supabase.from('behaviors').select('*').eq('course_id', courseId);
         if(behData) setBehaviors(behData);

         // Fetch Records for date
         const { data: recData } = await supabase.from('behavior_records').select('*').eq('date', date).in('behavior_id', (behData||[]).map(b=>b.id));
         
         const recMap = {};
         if(recData) {
             recData.forEach(r => {
                 if(!recMap[r.student_id]) recMap[r.student_id] = [];
                 recMap[r.student_id].push(r.behavior_id);
             });
         }
         setRecords(recMap);
         setLoading(false);
    }, [courseId, date]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddBehavior = async () => {
        if(!newBeh.name) return;
        await supabase.from('behaviors').insert([{...newBeh, course_id: courseId, point: 1}]);
        setIsConfiguring(false);
        setNewBeh({ name: '', type: 'positive' });
        fetchData();
        onNotify('เพิ่มหัวข้อสำเร็จ', 'success');
    };

    const handleDeleteBehavior = async (id) => {
        if(!confirm('ลบหัวข้อนี้?')) return;
        await supabase.from('behaviors').delete().eq('id', id);
        fetchData();
    };

    const toggleBehavior = (studentId, behaviorId) => {
        const current = records[studentId] || [];
        if(current.includes(behaviorId)) {
            setRecords(prev => ({...prev, [studentId]: current.filter(id => id !== behaviorId)}));
        } else {
            setRecords(prev => ({...prev, [studentId]: [...current, behaviorId]}));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        // Clear old records for this date/course behaviors
        const behaviorIds = behaviors.map(b => b.id);
        if(behaviorIds.length > 0) {
             // Ideally delete where behavior_id in behaviorIds AND date = date AND student_id in students
             // For simplicity, fetching all records again and diffing or bulk delete/insert
             // Here: Delete all for today then re-insert
             // Note: In production, optimize this.
             
             // Simple: Delete records for these behaviors on this date
             await supabase.from('behavior_records').delete().in('behavior_id', behaviorIds).eq('date', date);
             
             const toInsert = [];
             Object.keys(records).forEach(stdId => {
                 records[stdId].forEach(behId => {
                     toInsert.push({ student_id: stdId, behavior_id: behId, date: date });
                 });
             });
             
             if(toInsert.length > 0) await supabase.from('behavior_records').insert(toInsert);
        }
        setLoading(false);
        onNotify('บันทึกพฤติกรรมเรียบร้อย', 'success');
    };

    return (
        <div className="space-y-6 relative">
            {loading && <LoadingOverlay/>}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="flex items-center gap-4">
                     <div className="relative">
                         <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                         <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                     </div>
                     <button onClick={()=>setIsConfiguring(!isConfiguring)} className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 flex items-center"><Settings className="w-4 h-4 mr-2"/> ตั้งค่าหัวข้อ</button>
                 </div>
                 <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center font-bold"><Save className="w-4 h-4 mr-2"/> บันทึกพฤติกรรม</button>
            </div>

            {isConfiguring && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 animate-in fade-in">
                    <div className="flex gap-2 mb-4">
                        <input className="flex-1 p-2 border rounded" placeholder="ชื่อพฤติกรรม" value={newBeh.name} onChange={e=>setNewBeh({...newBeh, name:e.target.value})}/>
                        <select className="p-2 border rounded w-32" value={newBeh.type} onChange={e=>setNewBeh({...newBeh, type:e.target.value})}><option value="positive">บวก (+)</option><option value="negative">ลบ (-)</option></select>
                        <button onClick={handleAddBehavior} className="px-4 py-2 bg-green-600 text-white rounded">เพิ่ม</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {behaviors.map(b => (
                            <div key={b.id} className="flex justify-between items-center p-2 bg-white border rounded shadow-sm">
                                <span className={`text-sm ${b.type==='positive'?'text-green-600':'text-red-600'}`}>{b.name}</span>
                                <button onClick={()=>handleDeleteBehavior(b.id)} className="text-gray-400 hover:text-red-500"><XCircle className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase"><tr><th className="p-4 w-1/4">ชื่อ-สกุล</th>{behaviors.map(b=><th key={b.id} className="p-2 text-center text-xs">{b.name}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium">{s.name}</td>
                                {behaviors.map(b => (
                                    <td key={b.id} className="p-2 text-center">
                                        <button 
                                            onClick={()=>toggleBehavior(s.id, b.id)}
                                            className={`w-8 h-8 rounded border transition-all ${records[s.id]?.includes(b.id) ? (b.type==='positive'?'bg-green-500 border-green-500 text-white':'bg-red-500 border-red-500 text-white') : 'bg-white hover:bg-gray-100'}`}
                                        >
                                            {records[s.id]?.includes(b.id) && <CheckSquare className="w-4 h-4 mx-auto"/>}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 4. Admin Dashboard
const AdminDashboard = ({ onNotify }) => {
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(false);
    
    // Import/Manage Modal States
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [userForm, setUserForm] = useState({ username: '', password: '' });
    const [newTeacher, setNewTeacher] = useState({ name: '', username: '', password: '', email: '' });
    const [importFile, setImportFile] = useState(null);

    // Fetch Data
    const fetchAdminData = async () => {
        setLoading(true);
        const { data: stds } = await supabase.from('students').select('*').order('id');
        const { data: usrs } = await supabase.from('users').select('*').order('role');
        if (stds) setStudents(stds);
        if (usrs) setUsers(usrs);
        setLoading(false);
    };

    useEffect(() => { fetchAdminData(); }, []);

    // Handle File Import
    const handleFileChange = (e) => setImportFile(e.target.files[0]);

    const handleImportExcel = () => {
        if (!importFile) return onNotify('กรุณาเลือกไฟล์', 'error');
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                
                // Map Excel Columns -> DB Columns
                const newStudents = jsonData.map(row => ({
                    id: String(row['รหัสประจำตัว'] || ''),
                    name: row['ชื่อ-นามสกุล'] || '',
                    level: row['ระดับชั้น'] || '',
                    room: String(row['ห้องเรียน'] || row['ห้องเรียน '] || ''),
                    department: row['แผนกวิชา'] || '',
                    status: 'normal'
                })).filter(s => s.id && s.name);

                if (newStudents.length === 0) return onNotify('ไม่พบข้อมูลในไฟล์', 'error');

                // Upsert Students
                const { error: stdError } = await supabase.from('students').upsert(newStudents, { onConflict: 'id' });
                if (stdError) throw stdError;

                // Create Users for Students automatically (username=id, password=123)
                const newUsers = newStudents.map(s => ({
                    username: s.id,
                    password: '123', // Default Password
                    role: 'student',
                    name: s.name
                }));
                await supabase.from('users').upsert(newUsers, { onConflict: 'username' });

                onNotify(`นำเข้าสำเร็จ ${newStudents.length} รายการ`, 'success');
                setIsImportOpen(false);
                fetchAdminData();
            } catch (err) {
                console.error(err);
                onNotify('เกิดข้อผิดพลาด: ' + err.message, 'error');
            }
        };
        reader.readAsArrayBuffer(importFile);
    };

    const handleDeleteStudent = async (id) => {
        if (!confirm('ยืนยันลบนักเรียน? ข้อมูลการเรียนทั้งหมดจะหายไป')) return;
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (!error) {
            onNotify('ลบสำเร็จ', 'success');
            fetchAdminData();
        } else {
            onNotify('ลบไม่สำเร็จ', 'error');
        }
    };

    const handleSaveUser = async () => {
        if (!userForm.username || !userForm.password) return onNotify('กรุณากรอกข้อมูลให้ครบ', 'error');
        try {
            // Upsert User
            const payload = {
                username: userForm.username,
                password: userForm.password,
                role: selectedUser.role || 'student', 
                name: selectedUser.name
            };
            
            // If editing existing user, include ID to update
            if (selectedUser.table === 'users' && selectedUser.id) {
                await supabase.from('users').update(payload).eq('id', selectedUser.id);
            } else {
                await supabase.from('users').upsert(payload, { onConflict: 'username' });
            }

            onNotify('บันทึกข้อมูลผู้ใช้สำเร็จ', 'success');
            setIsUserModalOpen(false);
            fetchAdminData();
        } catch (err) {
            onNotify('บันทึกไม่สำเร็จ', 'error');
        }
    };

    const handleAddTeacher = async () => {
        if (!newTeacher.username || !newTeacher.password || !newTeacher.name) return onNotify('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        try {
            const { error } = await supabase.from('users').insert([{
                username: newTeacher.username,
                password: newTeacher.password,
                name: newTeacher.name,
                email: newTeacher.email,
                role: 'teacher'
            }]);

            if (error) throw error;
            onNotify('เพิ่มครูผู้สอนเรียบร้อย', 'success');
            setIsAddTeacherOpen(false);
            setNewTeacher({ name: '', username: '', password: '', email: '' });
            fetchAdminData();
        } catch (err) {
            onNotify('เพิ่มไม่สำเร็จ: ' + err.message, 'error');
        }
    };

    const openUserModal = (item, type) => {
        const existingUser = users.find(u => u.name === item.name) || {};
        setSelectedUser({ ...item, ...existingUser, role: type, table: type === 'teacher' ? 'users' : 'students' });
        setUserForm({ username: existingUser.username || item.id || '', password: existingUser.password || '' });
        setIsUserModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 relative">
            {loading && <LoadingOverlay/>}
            <h2 className="text-2xl font-bold text-gray-800 flex items-center"><Shield className="w-8 h-8 mr-2 text-orange-600"/> แผงควบคุมผู้ดูแลระบบ</h2>
            
            {/* Tabs */}
            <div className="flex border-b overflow-x-auto">
                {['students', 'teachers'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-bold capitalize whitespace-nowrap transition-colors border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab === 'students' ? 'ฐานข้อมูลนักเรียน' : 'ข้อมูลครูผู้สอน'}
                    </button>
                ))}
            </div>

            {/* Tab: Students */}
            {activeTab === 'students' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-700">รายชื่อนักเรียน ({students.length})</h3>
                        <button onClick={() => setIsImportOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-green-700 font-bold transition"><FileSpreadsheet className="w-4 h-4 mr-2"/> นำเข้า Excel</button>
                    </div>
                    {loading ? <div className="text-center p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500"/></div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 uppercase font-bold"><tr><th className="p-3">รหัส</th><th className="p-3">ชื่อ-สกุล</th><th className="p-3">ชั้น/ห้อง</th><th className="p-3">แผนก</th><th className="p-3 text-center">จัดการ</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50">
                                            <td className="p-3 font-mono">{s.id}</td>
                                            <td className="p-3 font-medium">{s.name}</td>
                                            <td className="p-3">{s.level}/{s.room}</td>
                                            <td className="p-3">{s.department}</td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <button onClick={() => openUserModal(s, 'student')} className="text-blue-500 bg-blue-50 p-2 rounded-full hover:bg-blue-100" title="ตั้งรหัสผ่าน"><Key className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteStudent(s.id)} className="text-red-500 bg-red-50 p-2 rounded-full hover:bg-red-100" title="ลบ"><Trash2 className="w-4 h-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Teachers (Users with role teacher) */}
            {activeTab === 'teachers' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-700">รายชื่อครูผู้สอน</h3>
                        <button onClick={() => setIsAddTeacherOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-blue-700 font-bold transition"><UserPlus className="w-4 h-4 mr-2"/> เพิ่มครูผู้สอน</button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase font-bold"><tr><th className="p-3">ชื่อ-สกุล</th><th className="p-3">Username</th><th className="p-3 text-center">จัดการ</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.filter(u => u.role === 'teacher').map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium">{u.name}</td>
                                        <td className="p-3 font-mono text-blue-600">{u.username}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => openUserModal(u, 'teacher')} className="text-blue-500 bg-blue-50 p-2 rounded-full hover:bg-blue-100"><Edit className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}

            {/* Modals */}
            <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="นำเข้าข้อมูลนักเรียน (Excel)">
                 <div className="space-y-4">
                     <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-gray-50">
                         <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
                         <label className="block text-sm font-bold text-gray-700 mb-2 cursor-pointer">
                             คลิกเพื่อเลือกไฟล์ Excel
                             <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" className="hidden"/>
                         </label>
                         {importFile && <p className="text-green-600 font-bold mt-2">{importFile.name}</p>}
                     </div>
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                         <h4 className="font-bold text-blue-800 mb-2 flex items-center"><Info className="w-4 h-4 mr-2"/> รูปแบบไฟล์ที่ต้องการ</h4>
                         <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
                             <li><b>รหัสประจำตัว</b> (สำคัญ)</li>
                             <li><b>ชื่อ-นามสกุล</b></li>
                             <li><b>ระดับชั้น</b> (เช่น ปวช. 1)</li>
                             <li><b>ห้องเรียน</b> (เช่น 1, 2)</li>
                             <li><b>แผนกวิชา</b></li>
                         </ul>
                     </div>
                     <div className="flex justify-end gap-2 pt-4">
                         <button onClick={() => setIsImportOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">ยกเลิก</button>
                         <button onClick={handleImportExcel} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700">ยืนยันนำเข้า</button>
                     </div>
                 </div>
            </Modal>

            <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={`ตั้งค่าผู้ใช้งาน: ${selectedUser?.name}`} size="sm">
                <div className="space-y-4">
                    <div><label className="text-sm font-bold text-gray-700 block mb-1">Username</label><input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={userForm.username} onChange={e=>setUserForm({...userForm, username:e.target.value})}/></div>
                    <div><label className="text-sm font-bold text-gray-700 block mb-1">Password</label><input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={userForm.password} onChange={e=>setUserForm({...userForm, password:e.target.value})}/></div>
                    <div className="flex justify-end gap-2 pt-4">
                         <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">ยกเลิก</button>
                         <button onClick={handleSaveUser} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">บันทึก</button>
                    </div>
                </div>
            </Modal>

            {/* Modal: Add Teacher */}
            <Modal isOpen={isAddTeacherOpen} onClose={() => setIsAddTeacherOpen(false)} title="เพิ่มครูผู้สอนใหม่" size="md">
                <div className="space-y-4">
                    <div><label className="text-sm font-bold text-gray-700 block mb-1">ชื่อ-นามสกุล</label><input className="w-full border p-2.5 rounded-lg" placeholder="นาย..." value={newTeacher.name} onChange={e=>setNewTeacher({...newTeacher, name:e.target.value})}/></div>
                    <div><label className="text-sm font-bold text-gray-700 block mb-1">อีเมล (ถ้ามี)</label><input className="w-full border p-2.5 rounded-lg" placeholder="teacher@school.ac.th" value={newTeacher.email} onChange={e=>setNewTeacher({...newTeacher, email:e.target.value})}/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-bold text-gray-700 block mb-1">Username</label><input className="w-full border p-2.5 rounded-lg" placeholder="teacher01" value={newTeacher.username} onChange={e=>setNewTeacher({...newTeacher, username:e.target.value})}/></div>
                        <div><label className="text-sm font-bold text-gray-700 block mb-1">Password</label><input className="w-full border p-2.5 rounded-lg" placeholder="1234" value={newTeacher.password} onChange={e=>setNewTeacher({...newTeacher, password:e.target.value})}/></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                         <button onClick={() => setIsAddTeacherOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">ยกเลิก</button>
                         <button onClick={handleAddTeacher} className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700">เพิ่มครูผู้สอน</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// 7. Teacher Dashboard & Main Logic
export default function ClassroomApp() {
  const [user, setUser] = useState(null); 
  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: null });
  const [loginError, setLoginError] = useState('');
  const [notification, setNotification] = useState(null);
  
  // App States (Real DB Data)
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTab, setCourseTab] = useState('students');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');

  // Add Course Modal State
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credits: 3, room: '', level: '', term: '1', year: String(new Date().getFullYear()+543), weights: { knowledge: 40, skill: 40, attitude: 20 } });
  
  // Import Student Modal State
  const [isImportStudentOpen, setIsImportStudentOpen] = useState(false);
  const [importSearch, setImportSearch] = useState({ id: '', name: '', level: '', room: '' });
  const [studentsToImport, setStudentsToImport] = useState([]);

  // Filters
  const [filterTerm, setFilterTerm] = useState('1');
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()+543));

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Initial Fetch Data from DB
  const fetchData = async () => {
      setLoading(true);
      try {
          const { data: cData } = await supabase.from('courses').select('*');
          const { data: sData } = await supabase.from('students').select('*');
          const { data: eData } = await supabase.from('enrollments').select('*');
          
          if(cData) setCourses(cData);
          if(sData) setStudents(sData);
          
          const enrollMap = {};
          if(eData) eData.forEach(e => {
              if(!enrollMap[e.course_id]) enrollMap[e.course_id] = [];
              enrollMap[e.course_id].push(e.student_id);
          });
          setEnrollments(enrollMap);
      } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if(user) fetchData(); }, [user]);

  // Handlers
  const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const { data } = await supabase.from('users').select('*').eq('username', loginForm.username).eq('password', loginForm.password).eq('role', loginForm.role).single();
          if (data) { setUser(data); setCurrentPage('dashboard'); }
          else if (loginForm.role === 'admin' && loginForm.password === '072889604') { setUser({ name: 'Admin', role: 'admin' }); setCurrentPage('dashboard'); } // Fallback Admin
          else setLoginError('ข้อมูลไม่ถูกต้อง');
      } catch(err) { setLoginError('เชื่อมต่อล้มเหลว'); } finally { setLoading(false); }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    setSelectedCourse(null);
    setLoginForm({ username: '', password: '', role: null });
  };

  const handleAddCourseSubmit = async () => {
      if(!newCourse.code || !newCourse.name) return showNotification('กรุณากรอกข้อมูลให้ครบ', 'error');
      
      try {
          // บันทึกลงฐานข้อมูลจริง
          const { data, error } = await supabase.from('courses').insert([{ ...newCourse, teacher_id: user.id }]).select();
          if(error) throw error;
          
          // อัปเดต state
          setCourses([...courses, ...data]);
          setEnrollments(prev => ({...prev, [data[0].id]: []}));
          
          // **สำคัญ:** เปลี่ยนตัวกรองให้ตรงกับวิชาใหม่ เพื่อให้เห็นวิชาทันที
          setFilterTerm(newCourse.term);
          setFilterYear(newCourse.year);
          
          setIsAddCourseOpen(false);
          showNotification('เพิ่มรายวิชาสำเร็จ');
      } catch(e) { 
          console.error(e);
          showNotification('เกิดข้อผิดพลาดในการบันทึก', 'error'); 
      }
  };

  const handleImportStudentsSubmit = async () => {
      if (studentsToImport.length === 0) return showNotification('กรุณาเลือกนักเรียน', 'error');
      try {
          // Prepare DB Inserts
          const toInsert = studentsToImport.map(sid => ({ course_id: selectedCourse.id, student_id: sid }));
          const { error } = await supabase.from('enrollments').insert(toInsert); // Assuming enrollments table exists
          if(error) throw error;
          
          // Update State
          setEnrollments(prev => ({ 
              ...prev, 
              [selectedCourse.id]: [...(prev[selectedCourse.id] || []), ...studentsToImport] 
          }));
          
          setIsImportStudentOpen(false);
          setStudentsToImport([]);
          showNotification(`เพิ่มนักเรียน ${studentsToImport.length} คน เรียบร้อย`, 'success');
      } catch(e) { 
          console.error(e);
          // If duplicate error, handle gracefully (maybe fetch fresh data)
          if(e.code === '23505') { // Unique violation
              fetchData(); // Sync with server
              setIsImportStudentOpen(false);
              showNotification('นำเข้าเรียบร้อย (บางคนอาจมีอยู่แล้ว)', 'success');
          } else {
              showNotification('เกิดข้อผิดพลาด', 'error'); 
          }
      }
  };

  const handleDeleteCourse = async (e, id) => {
    e.stopPropagation();
    if (confirm('คุณต้องการลบรายวิชานี้ใช่หรือไม่?')) {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if(!error) {
            setCourses(courses.filter(c => c.id !== id));
            showNotification('ลบรายวิชาสำเร็จ', 'success');
        } else {
            showNotification('ลบไม่สำเร็จ', 'error');
        }
    }
  };

  const handleRemoveStudentFromCourse = async (courseId, studentId) => {
    if(confirm('ต้องการลบนักเรียนคนนี้ออกจากรายวิชาใช่หรือไม่?')) {
        const { error } = await supabase.from('enrollments').delete().eq('course_id', courseId).eq('student_id', studentId);
        if(!error) {
            setEnrollments(prev => ({...prev, [courseId]: prev[courseId].filter(id => id !== studentId)}));
            showNotification('ลบนักเรียนออกจากรายวิชาเรียบร้อย', 'success');
        }
    }
  };

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
  
  // LOGIC for Select All Filtered Students (Checkbox)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans bg-cover bg-center" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')", backgroundColor: '#f3f4f6' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap'); body { font-family: 'Sarabun', sans-serif; }`}</style>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gradient-to-br from-[#1E3A8A] to-blue-900 p-10 flex flex-col justify-center items-center text-white relative">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <img src={LOGO_URL} alt="Logo" className="w-36 h-36 mb-6 drop-shadow-xl animate-pulse-slow" />
             <div className="text-center z-10">
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
                   <button type="submit" disabled={loading} className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg font-bold hover:bg-blue-800 shadow-lg transition-transform active:scale-95 font-sans mt-2 disabled:opacity-50">{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
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
                   {user.role === 'admin' && <AdminDashboard onNotify={showNotification} />}
                   {user.role === 'teacher' && <TeacherDashboard courses={courses} students={students} assignments={assignments} scores={scores} attendance={attendance} holidays={holidays} enrollments={enrollments} setEnrollments={setEnrollments} onNotify={showNotification} />}
                   {user.role === 'student' && <StudentDashboard studentId={user.id} courses={courses} assignments={assignments} scores={scores} attendance={attendance} holidays={holidays} />}
                </div>
            )}

            {/* VIEW: COURSES LIST */}
            {currentPage === 'courses' && !selectedCourse && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex space-x-4">
                           <div className="flex items-center gap-2"><span className="text-sm font-bold text-gray-600">ภาคเรียน:</span><select value={filterTerm} onChange={e=>setFilterTerm(e.target.value)} className="border rounded p-1"><option>1</option><option>2</option><option>Summer</option></select></div>
                           <div className="flex items-center gap-2"><span className="text-sm font-bold text-gray-600">ปีการศึกษา:</span><input value={filterYear} onChange={e=>setFilterYear(e.target.value)} className="border rounded p-1 w-20 text-center"/></div>
                        </div>
                        <button onClick={() => {
                            setNewCourse(prev => ({ ...prev, term: filterTerm, year: filterYear })); // Auto-fill current filter
                            setIsAddCourseOpen(true);
                        }} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 flex items-center transition"><Plus className="w-5 h-5 mr-2"/> เพิ่มรายวิชา</button>
                    </div>
                    {/* Course Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {filteredCourses.map(c => (
                           <div key={c.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border overflow-hidden group relative">
                               <div className="h-2 bg-blue-600"></div>
                               <button onClick={(e)=>handleDeleteCourse(e, c.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1 bg-white rounded-full shadow-sm z-10"><Trash2 className="w-5 h-5"/></button>
                               <div className="p-6">
                                   <div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{c.code}</span></div>
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
                    <button onClick={()=>setSelectedCourse(null)} className="mb-4 text-sm text-gray-500 hover:text-blue-600 flex items-center font-bold"><ChevronLeft className="w-4 h-4 mr-1"/> กลับหน้ารายวิชา</button>
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden min-h-[600px] flex flex-col">
                        {/* Course Tabs Navigation */}
                        <div className="flex border-b overflow-x-auto bg-gray-50/50">
                           {[
                               { id: 'students', label: 'รายชื่อ', icon: Users, color: 'text-purple-600' },
                               { id: 'attendance', label: 'เวลาเรียน', icon: Clock, color: 'text-blue-600' },
                               { id: 'scores', label: 'คะแนนเก็บ', icon: Edit, color: 'text-orange-600' },
                               { id: 'behavior', label: 'บันทึกพฤติกรรม', icon: Flag, color: 'text-emerald-600' },
                               { id: 'behavior_sum', label: 'สรุปพฤติกรรม', icon: Award, color: 'text-indigo-600' },
                               { id: 'summary', label: 'สรุปผล', icon: GraduationCap, color: 'text-pink-600' }
                           ].map(tab => (
                               <button 
                                 key={tab.id}
                                 onClick={() => setCourseTab(tab.id)}
                                 className={`px-6 py-4 flex items-center whitespace-nowrap text-sm font-bold border-b-4 transition-colors ${courseTab === tab.id ? `border-${tab.color.split('-')[1]}-500 ${tab.color} bg-white` : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                               >
                                   <tab.icon className={`w-4 h-4 mr-2 ${courseTab === tab.id ? tab.color : 'text-gray-400'}`}/> {tab.label}
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
                                <AttendanceCheck courseId={selectedCourse.id} students={students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id))} onNotify={showNotification} />
                            </div>

                            {/* 3. Scores Tab */}
                            <div style={{ display: courseTab === 'scores' ? 'block' : 'none' }}>
                                <ScoreManager courseId={selectedCourse.id} students={students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id))} onNotify={showNotification} />
                            </div>

                            {/* 4. Behavior Tab */}
                            <div style={{ display: courseTab === 'behavior' ? 'block' : 'none' }}>
                                <BehaviorManager courseId={selectedCourse.id} students={students.filter(s => (enrollments[selectedCourse.id]||[]).includes(s.id))} onNotify={showNotification} />
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
            
            {/* ADD COURSE MODAL - IMPROVED UI */}
            <Modal isOpen={isAddCourseOpen} onClose={() => setIsAddCourseOpen(false)} title="เพิ่มรายวิชาใหม่" size="md">
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
            </Modal>

            {/* IMPORT STUDENTS MODAL (With Select All) */}
            <Modal isOpen={isImportStudentOpen} onClose={() => setIsImportStudentOpen(false)} title="ดึงรายชื่อจากฐานข้อมูลกลาง" size="lg">
                <div className="flex flex-col h-[500px]">
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
                    <div className="pt-4 flex justify-between items-center border-t mt-2">
                        <span className="text-sm font-bold text-gray-600">เลือกแล้ว: {studentsToImport.length} คน</span>
                        <div className="flex gap-2">
                            <button onClick={()=>setIsImportStudentOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-600">ยกเลิก</button>
                            <button onClick={handleImportStudentsSubmit} className="px-6 py-2 bg-purple-600 text-white rounded font-bold shadow hover:bg-purple-700 flex items-center transition transform active:scale-95"><UserPlus className="w-4 h-4 mr-2"/> นำเข้าที่เลือก</button>
                        </div>
                    </div>
                 </div>
            </Modal>

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


.0.
         </div>
      </main>
    </div>
  );
}