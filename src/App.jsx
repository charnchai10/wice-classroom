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
  Flag, ThumbsUp, ThumbsDown, MoreVertical, Lock, Mail, Award, User, Shield, Key, FileText, List, UploadCloud, Users2, AlertTriangle
} from 'lucide-react';

// --- CONFIG & THEME ---
const THEME = {
  primary: '#1E3A8A', // Blue
  accent: '#FACC15', // Gold
  bg: '#F3F4F6',
  text: '#1F2937',
  font: "'Sarabun', sans-serif"
};

const LOGO_URL = "https://i.postimg.cc/CxmgLgc9/wice2567logo-e.png";

// --- MOCK DATA ---
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
  { id: '6620901001', name: 'นายสมชาย รักเรียน', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'normal' },
  { id: '6620901002', name: 'นางสาวสมหญิง จริงใจ', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'normal' },
  { id: '6620901003', name: 'นายมานะ อดทน', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'risk' },
  { id: '6620901004', name: 'นางสาวชูใจ ใฝ่ดี', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'normal' },
  { id: '6620901005', name: 'นายปิติ มีทรัพย์', level: 'ปวช. 2', room: '1', department: 'คอมพิวเตอร์ธุรกิจ', status: 'normal' },
];

const INITIAL_TEACHERS = [
    { id: 1, name: 'นายชาญชัย แก้วเถิน', email: 'charnchai10@gmail.com' },
    { id: 2, name: 'นางสาวใจดี มีสุข', email: 'jaidee@gmail.com' }
];

const INITIAL_ASSIGNMENTS = {
  1: [
    { id: 'a1', name: 'สอบกลางภาค', type: 'knowledge', maxScore: 20 },
    { id: 'a2', name: 'ใบงานที่ 1', type: 'skill', maxScore: 10 },
  ]
};

const INITIAL_SCORES = {
  '6620901001': { 'a1': 15, 'a2': 8 }, 
  '6620901002': { 'a1': 18, 'a2': 9 },
};

const INITIAL_BEHAVIORS = {
  1: [
    { id: 'b1', name: 'เข้าเรียนตรงเวลา', type: 'positive', point: 1 },
    { id: 'b2', name: 'แต่งกายเรียบร้อย', type: 'positive', point: 1 },
    { id: 'b3', name: 'ส่งงานล่าช้า', type: 'negative', point: 1 },
  ]
};

// --- UTILS ---
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
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce-in ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

// 3. Admin Dashboard
const AdminDashboard = ({ students, teachers, setStudents, onNotify }) => {
    const [activeTab, setActiveTab] = useState('students');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState(null); // Store selected file
    
    // User Management State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [userForm, setUserForm] = useState({ username: '', password: '' });
    
    // Bulk Password State
    const [bulkRoom, setBulkRoom] = useState('');
    const [bulkPassword, setBulkPassword] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImportFile(file);
        }
    };

    const handleImportExcel = () => {
        if (!importFile) {
            onNotify('กรุณาเลือกไฟล์ Excel ก่อน', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Read the first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                if (jsonData.length === 0) {
                     onNotify('ไม่พบข้อมูลในไฟล์', 'error');
                     return;
                }

                // Map data to student structure
                // Supports "ห้องเรียน" or "ห้องเรียน " (with space)
                const newStudents = jsonData.map(row => ({
                    id: String(row['รหัสประจำตัว'] || ''),
                    name: row['ชื่อ-นามสกุล'] || '',
                    level: row['ระดับชั้น'] || '',
                    room: String(row['ห้องเรียน'] || row['ห้องเรียน '] || ''), 
                    department: row['แผนกวิชา'] || '',
                    status: 'normal'
                })).filter(s => s.id && s.name); // Filter out empty rows

                setStudents(prev => {
                    const existingIds = new Set(prev.map(s => s.id));
                    const uniqueNewStudents = newStudents.filter(s => !existingIds.has(s.id));
                    
                    if (uniqueNewStudents.length === 0) {
                        onNotify('ไม่พบข้อมูลใหม่ หรือข้อมูลซ้ำกับที่มีอยู่แล้ว', 'error');
                        return prev;
                    }
                    onNotify(`นำเข้าข้อมูลสำเร็จ ${uniqueNewStudents.length} รายการ`, 'success');
                    return [...prev, ...uniqueNewStudents];
                });
                
                setIsImportOpen(false);
                setImportFile(null); // Reset file
                
            } catch (error) {
                console.error("Import Error:", error);
                onNotify('เกิดข้อผิดพลาดในการอ่านไฟล์ โปรดตรวจสอบรูปแบบไฟล์', 'error');
            }
        };
        reader.readAsArrayBuffer(importFile);
    };

    const handleDeleteStudent = (studentId) => {
        if(confirm('คุณต้องการลบนักเรียนคนนี้ออกจากฐานข้อมูลกลางหรือไม่? (ข้อมูลในทุกรายวิชาจะหายไป)')) {
            setStudents(prev => prev.filter(s => s.id !== studentId));
            onNotify('ลบนักเรียนเรียบร้อยแล้ว', 'success');
        }
    };

    const handleSetUser = (user, type) => {
        setSelectedUser({ ...user, type });
        setIsUserModalOpen(true);
    };

    const handleSaveUser = () => {
        onNotify(`บันทึกชื่อผู้ใช้งานและรหัสผ่านสำหรับ ${selectedUser.name} สำเร็จ`, 'success');
        setIsUserModalOpen(false);
        setUserForm({ username: '', password: '' });
    };

    const handleBulkSetPassword = () => {
        if (!bulkRoom || !bulkPassword) {
            onNotify('กรุณาเลือกห้องและกำหนดรหัสผ่าน', 'error');
            return;
        }
        onNotify(`กำหนดรหัสผ่านสำหรับนักเรียนห้อง ${bulkRoom} ทั้งหมดเป็น "${bulkPassword}" สำเร็จ`, 'success');
        setBulkRoom('');
        setBulkPassword('');
    };

    const rooms = [...new Set(students.map(s => s.room))].sort();

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Shield className="w-8 h-8 mr-2 text-orange-600"/> แผงควบคุมผู้ดูแลระบบ
            </h2>

            <div className="flex space-x-2 border-b overflow-x-auto">
                <button 
                    className={`px-4 py-2 font-bold whitespace-nowrap ${activeTab === 'students' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('students')}
                >
                    ฐานข้อมูลนักเรียน
                </button>
                <button 
                    className={`px-4 py-2 font-bold whitespace-nowrap ${activeTab === 'teachers_user' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('teachers_user')}
                >
                    บัญชีผู้ใช้ (ครู)
                </button>
                <button 
                    className={`px-4 py-2 font-bold whitespace-nowrap ${activeTab === 'students_user' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('students_user')}
                >
                    บัญชีผู้ใช้ (นักเรียน)
                </button>
            </div>

            {activeTab === 'students' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold text-lg">รายชื่อนักเรียนทั้งหมด ({students.length})</h3>
                        <button 
                            onClick={() => setIsImportOpen(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-green-700"
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2"/> นำเข้า Excel
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 uppercase text-gray-600">
                                <tr>
                                    <th className="p-3">รหัส</th>
                                    <th className="p-3">ชื่อ-สกุล</th>
                                    <th className="p-3">ระดับชั้น</th>
                                    <th className="p-3">ห้อง</th>
                                    <th className="p-3">แผนกวิชา</th>
                                    <th className="p-3 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-mono">{s.id}</td>
                                        <td className="p-3 font-medium">{s.name}</td>
                                        <td className="p-3">{s.level}</td>
                                        <td className="p-3">{s.room}</td>
                                        <td className="p-3">{s.department || '-'}</td>
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => handleDeleteStudent(s.id)}
                                                className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                                title="ลบนักเรียน"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Teachers User Management */}
            {activeTab === 'teachers_user' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-4">จัดการบัญชีครูผู้สอน</h3>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3">ชื่อ-สกุล</th>
                                <th className="p-3">อีเมล</th>
                                <th className="p-3 text-right">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map(u => (
                                <tr key={u.id} className="border-b">
                                    <td className="p-3">{u.name}</td>
                                    <td className="p-3 text-gray-500">{u.email}</td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={() => handleSetUser(u, 'ครู')}
                                            className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 font-medium"
                                        >
                                            <Key className="w-4 h-4 inline mr-1"/> ตั้งรหัสผ่าน
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Students User Management (Individual & Bulk) */}
            {activeTab === 'students_user' && (
                <div className="space-y-6">
                    {/* Bulk Settings */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-800 mb-4 flex items-center">
                            <Users2 className="w-5 h-5 mr-2"/> กำหนดรหัสผ่านแบบกลุ่ม (รายห้อง)
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:w-1/3">
                                <label className="text-xs font-bold text-blue-600 block mb-1">เลือกห้องเรียน</label>
                                <select 
                                    className="w-full p-2 border rounded-lg"
                                    value={bulkRoom}
                                    onChange={e => setBulkRoom(e.target.value)}
                                >
                                    <option value="">-- เลือกห้อง --</option>
                                    {rooms.map(r => <option key={r} value={r}>ห้อง {r}</option>)}
                                </select>
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="text-xs font-bold text-blue-600 block mb-1">กำหนดรหัสผ่านใหม่</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="เช่น 1234 หรือ รหัสนักเรียน"
                                    value={bulkPassword}
                                    onChange={e => setBulkPassword(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleBulkSetPassword}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md w-full md:w-auto"
                            >
                                บันทึกให้ทั้งห้อง
                            </button>
                        </div>
                    </div>

                    {/* Individual List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4">รายชื่อนักเรียน (กำหนดรายบุคคล)</h3>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">รหัส</th>
                                    <th className="p-3">ชื่อ-สกุล</th>
                                    <th className="p-3">ห้อง</th>
                                    <th className="p-3 text-right">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(u => (
                                    <tr key={u.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-mono text-gray-500">{u.id}</td>
                                        <td className="p-3">{u.name}</td>
                                        <td className="p-3">{u.room}</td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => handleSetUser(u, 'นักเรียน')}
                                                className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 font-medium"
                                            >
                                                <Key className="w-4 h-4 inline mr-1"/> ตั้งรหัสผ่าน
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                             <h3 className="font-bold text-xl flex items-center text-gray-800">
                                <UploadCloud className="w-6 h-6 mr-2 text-green-600"/> นำเข้าข้อมูลนักเรียน
                             </h3>
                             <button onClick={() => setIsImportOpen(false)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6"/></button>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">เลือกไฟล์ Excel (.xlsx, .xls)</label>
                            <input 
                                type="file" 
                                accept=".xlsx, .xls" 
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                            <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> รูปแบบไฟล์ที่ต้องการ</h4>
                            <p className="text-xs text-blue-700 mb-2">โปรดตรวจสอบว่าไฟล์ Excel ของคุณมีหัวข้อคอลัมน์ดังนี้ (เรียงลำดับหรือไม่ก็ได้):</p>
                            <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1 font-mono bg-white p-2 rounded border border-blue-100">
                                <li>รหัสประจำตัว</li>
                                <li>ชื่อ-นามสกุล</li>
                                <li>ระดับชั้น (เช่น ปวช. 1)</li>
                                <li>ห้องเรียน (เช่น 1, 2)</li>
                                <li>แผนกวิชา</li>
                            </ul>
                        </div>

                        <div className="flex justify-end space-x-2 border-t pt-4">
                            <button onClick={() => setIsImportOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">ยกเลิก</button>
                            <button onClick={handleImportExcel} className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-bold flex items-center">
                                <FileSpreadsheet className="w-4 h-4 mr-2"/> ยืนยันนำเข้าข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Modal */}
            {isUserModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-96 animate-fade-in">
                        <h3 className="font-bold text-lg mb-4">กำหนดผู้ใช้งาน: {selectedUser.name}</h3>
                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500">ชื่อผู้ใช้งาน (Username)</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={userForm.username} 
                                    onChange={e => setUserForm({...userForm, username: e.target.value})}
                                    placeholder="ตั้งชื่อผู้ใช้งาน"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">รหัสผ่าน (Password)</label>
                                <input 
                                    type="password" 
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={userForm.password} 
                                    onChange={e => setUserForm({...userForm, password: e.target.value})}
                                    placeholder="ตั้งรหัสผ่าน"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2"><button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">ยกเลิก</button><button onClick={handleSaveUser} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold">บันทึก</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 1. Teacher Dashboard
const TeacherDashboard = ({ courses, students, assignments, scores, attendance, holidays, enrollments, setEnrollments, onNotify }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('all');

  const stats = useMemo(() => {
    let targetCourses = courses;
    if (selectedCourseId !== 'all') { targetCourses = courses.filter(c => c.id === Number(selectedCourseId)); }
    const gradeCounts = { '4': 0, '3-3.5': 0, '2-2.5': 0, '0-1.5': 0, 'ขร.': 0 };
    const attendCounts = { '>80%': 0, '<80%': 0 };
    const dailyStats = { present: 0, absent: 0, sick: 0, leave: 0 };
    const studentScores = [];
    
    // Filter students enrolled in target courses
    const relevantStudents = students.filter(s => {
         return targetCourses.some(c => {
             const enrolledIds = enrollments[c.id] || [];
             return enrolledIds.includes(s.id);
         });
    });

    relevantStudents.forEach(std => {
      let totalCourseScore = 0; let totalAttendancePercent = 0; let courseCount = 0;
      targetCourses.forEach(course => {
          const enrolledIds = enrollments[course.id] || [];
          if (!enrolledIds.includes(std.id)) return; // Skip if not enrolled

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

// ... StudentDashboard, AttendanceCheck, ScoreManager, BehaviorManager, BehaviorSummary (Reuse exact same components)
const StudentDashboard = ({ studentId, courses, assignments, scores, attendance, holidays }) => {
    const sId = studentId || '6620901001'; 
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <h2 className="text-2xl font-bold text-gray-800">ข้อมูลผลการเรียนของคุณ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => {
                    const courseAssigns = assignments[course.id] || [];
                    const stdScores = scores[sId] || {};
                    let k = 0, s = 0;
                    courseAssigns.forEach(a => { const sc = Number(stdScores[a.id] || 0); if(a.type === 'knowledge') k += sc; if(a.type === 'skill') s += sc; });
                    const a = course.weights.attitude; const totalScore = k + s + a;
                    const attendRecord = attendance[sId] || {};
                    const validDates = Object.keys(attendRecord).filter(date => !holidays[date]);
                    const presentCount = validDates.filter(d => attendRecord[d] === 'present').length;
                    const totalSessions = validDates.length || 1;
                    const attendPercent = Math.round((presentCount / totalSessions) * 100);
                    const grade = calculateGrade(totalScore, attendPercent);
                    return (
                        <div key={course.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"><div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div><div className="p-6"><h3 className="font-bold text-lg text-gray-800 mb-1">{course.name}</h3><p className="text-xs text-gray-500 mb-4">{course.code}</p><div className="grid grid-cols-2 gap-4 mb-4"><div className="bg-blue-50 p-3 rounded-lg text-center"><div className="text-xs text-blue-600 font-bold uppercase">เกรด</div><div className="text-2xl font-bold text-blue-800">{grade}</div></div><div className="bg-green-50 p-3 rounded-lg text-center"><div className="text-xs text-green-600 font-bold uppercase">คะแนนรวม</div><div className="text-2xl font-bold text-green-800">{totalScore}</div></div></div><div className="mb-4"><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">เวลาเรียน</span><span className={`font-bold ${attendPercent < 80 ? 'text-red-500' : 'text-green-500'}`}>{attendPercent}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${attendPercent < 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${attendPercent}%` }}></div></div><div className="text-xs text-gray-400 mt-1 text-right">มา {presentCount} / {totalSessions} ครั้ง</div></div><div className="border-t pt-4"><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">รายละเอียดคะแนน</h4><div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">{courseAssigns.length > 0 ? courseAssigns.map(assign => (<div key={assign.id} className="flex justify-between text-sm"><span className="truncate w-3/4">{assign.name}</span><span className="font-medium text-gray-700">{stdScores[assign.id] !== undefined ? stdScores[assign.id] : '-'} / {assign.maxScore}</span></div>)) : <p className="text-xs text-gray-400 italic">ยังไม่มีการเก็บคะแนน</p>}</div></div></div></div>
                    );
                })}
            </div>
        </div>
    );
};

const AttendanceCheck = ({ students, date, setDate, attendance, onCheck, onSave, holidays, onToggleHoliday }) => {
  const isHoliday = holidays[date];
  const handleBulkCheck = (status) => { if (isHoliday) return; students.forEach(std => onCheck(std.id, date, status)); };
  const statusOptions = [ { val: 'present', label: 'มาเรียน', color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200', active: 'bg-green-600 text-white border-green-600' }, { val: 'absent', label: 'ขาดเรียน', color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200', active: 'bg-red-600 text-white border-red-600' }, { val: 'leave', label: 'ลากิจ', color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200', active: 'bg-blue-600 text-white border-blue-600' }, { val: 'sick', label: 'ลาป่วย', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200', active: 'bg-yellow-500 text-white border-yellow-500' }, ];
  return (<div className="space-y-4"><div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4"><div className="flex flex-col md:flex-row items-center gap-4"><div><label className="text-blue-800 text-xs font-bold uppercase mb-1 block">วันที่เช็คชื่อ</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 bg-white" /></div><div className="flex items-center space-x-2 pt-5"><input type="checkbox" id="holidayCheck" checked={!!isHoliday} onChange={() => onToggleHoliday(date)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" /><label htmlFor="holidayCheck" className={`font-bold ${isHoliday ? 'text-red-600' : 'text-gray-600'}`}>วันหยุดราชการ</label></div></div>{!isHoliday && (<div className="flex space-x-2"><button onClick={() => handleBulkCheck('present')} className="px-4 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg font-bold hover:bg-green-100">มาครบ</button><button onClick={() => handleBulkCheck('absent')} className="px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold hover:bg-red-100">ขาดครบ</button></div>)}<button onClick={onSave} className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center transition-transform hover:scale-105 font-bold"><Save className="w-5 h-5 mr-2" /> บันทึก</button></div>{isHoliday ? (<div className="bg-red-50 border-2 border-dashed border-red-200 p-10 rounded-xl text-center"><h3 className="text-red-600 font-bold text-xl mb-2">⛔ วันนี้เป็นวันหยุดราชการ</h3><p className="text-red-400">ระบบจะไม่นำวันนี้ไปคำนวณเวลาเรียน</p></div>) : (<div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"><table className="w-full text-left"><thead className="bg-gray-50 text-gray-700 text-sm uppercase"><tr><th className="px-6 py-4">รหัส / ชื่อ-สกุล</th><th className="px-6 py-4 text-center">สถานะ</th></tr></thead><tbody className="divide-y divide-gray-100">{students.map((std) => { const status = attendance[std.id]?.[date] || ''; return (<tr key={std.id} className="hover:bg-blue-50 transition-colors"><td className="px-6 py-4"><div className="font-mono text-gray-500 text-xs">{std.id}</div><div className="font-bold text-gray-800">{std.name}</div></td><td className="px-6 py-4"><div className="flex justify-center flex-wrap gap-2">{statusOptions.map((opt) => (<button key={opt.val} onClick={() => onCheck(std.id, date, opt.val)} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${status === opt.val ? `${opt.active} shadow-md transform scale-105` : `${opt.color}`}`}>{opt.label}</button>))}</div></td></tr>); })}</tbody></table></div>)}</div>);
};

const ScoreManager = ({ students, course, assignments, scores, onUpdateScore, onAddAssignment, onDeleteAssignment, onSave }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAssign, setNewAssign] = useState({ name: '', type: 'knowledge', maxScore: 10 });
  const handleAdd = () => { if(!newAssign.name) return; onAddAssignment(course.id, newAssign); setIsAdding(false); setNewAssign({ name: '', type: 'knowledge', maxScore: 10 }); };
  const getAssignmentsByType = (type) => assignments.filter(a => a.type === type);
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl shadow-sm border border-orange-100">
        <div><h3 className="font-bold text-orange-900 text-lg flex items-center"><Edit className="w-5 h-5 mr-2" /> บันทึกคะแนนเก็บ</h3><p className="text-orange-700 text-sm mt-1">คะแนนเจตคติจะถูกคำนวณอัตโนมัติจากส่วนพฤติกรรม</p></div>
        <div className="flex space-x-3 mt-4 md:mt-0"><button onClick={() => setIsAdding(!isAdding)} className="bg-white text-orange-600 border border-orange-200 px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-orange-50"><Plus className="w-4 h-4 mr-2" /> เพิ่มหัวข้อ</button><button onClick={onSave} className="bg-orange-600 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-700 flex items-center transition-transform hover:scale-105"><Save className="w-5 h-5 mr-2" /> บันทึกคะแนน</button></div>
      </div>
      {isAdding && (<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg animate-fade-in relative"><button onClick={() => setIsAdding(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><XCircle className="w-5 h-5"/></button><h4 className="font-bold text-gray-800 mb-4">เพิ่มหัวข้อคะแนนใหม่</h4><div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"><div><label className="block text-xs font-bold text-gray-500 mb-1">ชื่อหัวข้อ</label><input type="text" className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none" value={newAssign.name} onChange={e => setNewAssign({...newAssign, name: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-500 mb-1">ประเภท</label><select className="w-full p-2 border rounded-lg bg-gray-50" value={newAssign.type} onChange={e => setNewAssign({...newAssign, type: e.target.value})}><option value="knowledge">ความรู้ (Knowledge)</option><option value="skill">ทักษะ (Skill)</option></select></div><div><label className="block text-xs font-bold text-gray-500 mb-1">คะแนนเต็ม</label><input type="number" className="w-full p-2 border rounded-lg bg-gray-50" value={newAssign.maxScore} onChange={e => setNewAssign({...newAssign, maxScore: Number(e.target.value)})} /></div><button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-green-700">ยืนยัน</button></div></div>)}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto border border-gray-100"><table className="w-full text-left border-collapse"><thead className="bg-gray-50 text-gray-700 text-sm uppercase font-bold"><tr><th className="px-4 py-4 sticky left-0 bg-gray-50 z-10 border-b min-w-[200px]">ชื่อ-สกุล</th>{['knowledge', 'skill'].map(type => { const typeAssigns = getAssignmentsByType(type); if (typeAssigns.length === 0) return null; return (<React.Fragment key={type}>{typeAssigns.map(a => (<th key={a.id} className="px-2 py-4 text-center border min-w-[100px] bg-white group relative"><div className="text-[10px] text-gray-400 uppercase tracking-wider">{type}</div><div className="text-gray-800">{a.name}</div><div className="text-xs text-gray-500 font-normal">({a.maxScore})</div><button onClick={() => onDeleteAssignment(course.id, a.id)} className="absolute top-1 right-1 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="ลบหัวข้อนี้"><Trash2 className="w-3 h-3" /></button></th>))}<th className={`px-2 py-4 text-center border-r min-w-[80px] ${type === 'knowledge' ? 'bg-blue-50 text-blue-800' : 'bg-orange-50 text-orange-700'}`}>รวม<br/>{type === 'knowledge' ? 'K' : 'S'}</th></React.Fragment>);})}<th className="px-4 py-4 text-center bg-gray-100 text-gray-800 sticky right-0 z-10 border-l">รวมคะแนน<br/>(ไม่รวมเจตคติ)</th></tr></thead><tbody className="divide-y divide-gray-100">{students.map((std) => { let totalScore = 0; return (<tr key={std.id} className="hover:bg-gray-50 transition-colors"><td className="px-4 py-3 font-bold text-gray-700 sticky left-0 bg-white shadow-sm border-r">{std.name}</td>{['knowledge', 'skill'].map(type => { const typeAssigns = getAssignmentsByType(type); if (typeAssigns.length === 0) return null; let typeTotal = 0; return (<React.Fragment key={type}>{typeAssigns.map(a => { const score = scores[std.id]?.[a.id] || 0; typeTotal += Number(score); return (<td key={a.id} className="px-2 py-3 text-center border-r"><input type="number" className="w-16 p-1 text-center border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={scores[std.id]?.[a.id] || ''} placeholder="0" max={a.maxScore} onChange={(e) => onUpdateScore(std.id, a.id, e.target.value, a.maxScore)} /></td>); })}<td className={`px-2 py-3 text-center font-bold border-r ${type === 'knowledge' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>{typeTotal}</td></React.Fragment>); })}{(() => { const stdScores = scores[std.id] || {}; const relevantAssigns = [...getAssignmentsByType('knowledge'), ...getAssignmentsByType('skill')]; totalScore = relevantAssigns.reduce((sum, a) => sum + Number(stdScores[a.id] || 0), 0); })()}<td className="px-4 py-3 text-center font-bold text-gray-800 bg-gray-100 sticky right-0 border-l">{totalScore}</td></tr>); })}</tbody></table></div></div>);
};

const BehaviorManager = ({ students, course, behaviors, behaviorRecords, onUpdateBehavior, onSave, onUpdateBehaviorsList }) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [newBehavior, setNewBehavior] = useState({ name: '', type: 'positive', point: 1 });
  const handleAddBehavior = () => { if (!newBehavior.name) return; const newId = 'b_' + Date.now(); onUpdateBehaviorsList([...behaviors, { ...newBehavior, id: newId }]); setNewBehavior({ name: '', type: 'positive', point: 1 }); };
  const handleRemoveBehavior = (id) => { onUpdateBehaviorsList(behaviors.filter(b => b.id !== id)); };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl shadow-sm border border-emerald-100">
         <div className="flex items-center space-x-4"><div><label className="text-emerald-800 text-xs font-bold uppercase mb-1 block">วันที่บันทึกพฤติกรรม</label><input type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} className="border border-emerald-200 rounded-lg px-3 py-2 text-emerald-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" /></div><button onClick={() => setIsConfiguring(!isConfiguring)} className="mt-5 bg-white text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg text-sm flex items-center shadow-sm hover:bg-emerald-50"><Settings className="w-4 h-4 mr-2" /> ตั้งค่าหัวข้อ</button></div><button onClick={onSave} className="mt-4 md:mt-0 bg-emerald-600 text-white px-6 py-2 rounded-lg shadow hover:bg-emerald-700 flex items-center transition-transform hover:scale-105"><Save className="w-5 h-5 mr-2" /> บันทึกพฤติกรรม</button>
      </div>
      {isConfiguring && (<div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-lg animate-fade-in mb-4"><h4 className="font-bold text-emerald-800 mb-4 flex items-center"><Flag className="w-5 h-5 mr-2"/> ตั้งค่าหัวข้อพฤติกรรม</h4><div className="flex gap-2 mb-4 items-end bg-emerald-50 p-4 rounded-lg"><div className="flex-1"><label className="text-xs text-emerald-600 font-bold">ชื่อพฤติกรรม</label><input type="text" className="w-full p-2 border rounded" value={newBehavior.name} onChange={e => setNewBehavior({...newBehavior, name: e.target.value})} placeholder="เช่น ช่วยเหลือเพื่อน" /></div><div className="w-32"><label className="text-xs text-emerald-600 font-bold">ประเภท</label><select className="w-full p-2 border rounded" value={newBehavior.type} onChange={e => setNewBehavior({...newBehavior, type: e.target.value})}><option value="positive">บวก (+)</option><option value="negative">ลบ (-)</option></select></div><button onClick={handleAddBehavior} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">เพิ่ม</button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{behaviors.map(b => (<div key={b.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"><div className="flex items-center"><div className={`w-2 h-2 rounded-full mr-2 ${b.type === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}></div><span>{b.name}</span></div><button onClick={() => handleRemoveBehavior(b.id)} className="text-red-400 hover:text-red-600"><XCircle className="w-4 h-4"/></button></div>))}</div></div>)}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"><table className="w-full text-left"><thead className="bg-gray-50 text-gray-600 text-sm uppercase"><tr><th className="px-4 py-4 w-1/4">ชื่อ-สกุล</th>{behaviors.map(b => (<th key={b.id} className="px-2 py-4 text-center min-w-[100px]"><span className={`px-2 py-1 rounded text-xs font-bold ${b.type === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.name}</span></th>))}</tr></thead><tbody className="divide-y divide-gray-100">{students.map(std => { const stdRec = behaviorRecords[std.id]?.[currentDate] || []; return (<tr key={std.id} className="hover:bg-emerald-50 transition-colors"><td className="px-4 py-3 font-medium text-gray-800">{std.name}</td>{behaviors.map(b => { const isChecked = stdRec.includes(b.id); return (<td key={b.id} className="px-2 py-3 text-center"><button onClick={() => onUpdateBehavior(std.id, currentDate, b.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all transform hover:scale-110 ${isChecked ? (b.type === 'positive' ? 'bg-green-500 text-white shadow-md' : 'bg-red-500 text-white shadow-md') : 'bg-white border-2 border-gray-200 text-gray-300'}`}>{isChecked && <CheckCircle className="w-5 h-5" />}</button></td>); })}</tr>); })}</tbody></table></div></div>);
};

const BehaviorSummary = ({ students, behaviors, behaviorRecords, maxAttitudeScore }) => {
  return (<div className="space-y-6"><div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-gray-800 flex items-center text-lg"><Award className="w-6 h-6 mr-2 text-purple-600"/> สรุปพฤติกรรม & คะแนนเจตคติ (เต็ม {maxAttitudeScore})</h3><button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm hover:bg-green-700 shadow"><FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel</button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-purple-50 text-purple-900 font-bold uppercase"><tr><th className="px-4 py-4 text-left rounded-tl-lg">ชื่อ-สกุล</th>{behaviors.map(b => (<th key={b.id} className="px-2 py-4 text-center">{b.name} (%)</th>))}<th className="px-4 py-4 text-center bg-purple-100 rounded-tr-lg">คะแนนเจตคติ</th></tr></thead><tbody className="divide-y divide-purple-50">{students.map(std => { const attitudeScore = calculateAttitudeScore(std.id, behaviors, behaviorRecords, maxAttitudeScore); const studentRecords = behaviorRecords[std.id] || {}; const recordedDates = Object.keys(studentRecords); const totalDays = recordedDates.length || 1; return (<tr key={std.id} className="hover:bg-purple-50 transition-colors"><td className="px-4 py-3 font-medium text-gray-800">{std.name}</td>{behaviors.map(b => { let count = 0; recordedDates.forEach(date => { const hasBehavior = studentRecords[date]?.includes(b.id); if (b.type === 'positive' && hasBehavior) count++; if (b.type === 'negative' && !hasBehavior) count++; }); const percent = Math.round((count / totalDays) * 100); return (<td key={b.id} className="px-2 py-3 text-center"><div className="relative w-full bg-gray-200 rounded-full h-2.5 mb-1"><div className={`h-2.5 rounded-full ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${percent}%`}}></div></div><span className="text-xs text-gray-500">{percent}%</span></td>); })}<td className="px-4 py-3 text-center font-bold text-purple-700 bg-purple-50 text-lg">{attitudeScore}</td></tr>); })}</tbody></table></div></div></div>);
};

// --- MAIN APP ---
export default function ClassroomApp() {
  const [user, setUser] = useState(null); 
  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: null });
  const [loginError, setLoginError] = useState('');

  const [currentPage, setCurrentPage] = useState('login');
  const [selectedCourse, setSelectedCourse] = useState(null);
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
  const [enrollments, setEnrollments] = useState({}); // New: Store enrollments { courseId: [studentIds] }
  
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Init enrollments (Mock: All students in all courses initially)
  useEffect(() => {
    const initialEnrollments = {};
    courses.forEach(c => {
        initialEnrollments[c.id] = students.map(s => s.id);
    });
    setEnrollments(initialEnrollments);
  }, []);

  // Filter States
  const [filterTerm, setFilterTerm] = useState('1');
  const [filterYear, setFilterYear] = useState('2567');
  
  // Add Course Modal State
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
     code: '', name: '', credits: 3, room: '', term: '1', year: '2567', level: 'ปวช. 2',
     weights: { knowledge: 40, skill: 40, attitude: 20 }
  });

  // Add Student State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ id: '', name: '', level: '', room: '' });
  
  // Import Student Modal State
  const [isImportStudentOpen, setIsImportStudentOpen] = useState(false);
  const [importFile, setImportFile] = useState(null); // Store selected file

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginForm.role === 'teacher') {
       if (loginForm.username && loginForm.password) {
          // In real app, check DB. Mock:
          setUser({ name: 'นายชาญชัย แก้วเถิน', role: 'teacher' });
          setCurrentPage('dashboard');
       } else {
          setLoginError('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
       }
    } else if (loginForm.role === 'admin') {
       if (loginForm.password === '072889604') {
          setUser({ name: 'ผู้ดูแลระบบ', role: 'admin' });
          setCurrentPage('dashboard');
       } else {
          setLoginError('รหัสผ่านไม่ถูกต้อง');
       }
    } else if (loginForm.role === 'student') {
       if (loginForm.username && loginForm.password) {
          // In real app, check DB. Mock:
          setUser({ name: 'นายสมชาย รักเรียน', role: 'student', id: '6620901001' });
          setCurrentPage('dashboard');
       } else {
          setLoginError('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
       }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    setSelectedCourse(null);
    setLoginForm({ username: '', password: '', role: null });
  };

  const handleAddCourseSubmit = () => {
    if (!newCourse.code || !newCourse.name) return;
    const courseToAdd = { ...newCourse, id: Date.now() };
    setCourses((prevCourses) => [...prevCourses, courseToAdd]);
    setAssignments({...assignments, [courseToAdd.id]: []});
    setBehaviors({...behaviors, [courseToAdd.id]: [...(behaviors[1] || [])] });
    
    // Auto-enroll all current students to new course (Mock convenience)
    setEnrollments(prev => ({...prev, [courseToAdd.id]: students.map(s => s.id)}));

    setIsAddCourseOpen(false);
    if(newCourse.term !== filterTerm) setFilterTerm(newCourse.term);
    if(newCourse.year !== filterYear) setFilterYear(newCourse.year);
    showNotification('เพิ่มรายวิชาสำเร็จ');
  };

  const handleAddStudentSubmit = () => {
    if (!newStudent.id || !newStudent.name) return;
    const studentToAdd = { ...newStudent, status: 'normal' };
    setStudents(prev => [...prev, studentToAdd]);
    setIsAddStudentOpen(false);
    setNewStudent({ id: '', name: '', level: '', room: '' });
    showNotification('เพิ่มนักเรียนเรียบร้อย');
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) setImportFile(file);
  };

  const handleImportExcel = () => {
    if (!importFile) {
        showNotification('กรุณาเลือกไฟล์ก่อน', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Map data to student structure based on CSV/Excel headers
            const newStudents = jsonData.map(row => ({
                id: String(row['รหัสประจำตัว'] || ''), 
                name: row['ชื่อ-นามสกุล'] || '',
                level: row['ระดับชั้น'] || '',
                room: String(row['ห้องเรียน'] || row['ห้องเรียน '] || ''), // Handle whitespace in key
                department: row['แผนกวิชา'] || '',
                status: 'normal'
            })).filter(s => s.id && s.name); // Basic validation

            if (newStudents.length === 0) {
                 showNotification('ไม่พบข้อมูลในไฟล์ หรือรูปแบบคอลัมน์ไม่ถูกต้อง', 'error');
                 return;
            }

            setStudents(prev => {
                const existingIds = new Set(prev.map(s => s.id));
                const uniqueNewStudents = newStudents.filter(s => !existingIds.has(s.id));
                return [...prev, ...uniqueNewStudents];
            });

            showNotification(`นำเข้าข้อมูลนักเรียนสำเร็จ ${newStudents.length} รายการ`, 'success');
            setIsImportOpen(false);
            setImportFile(null); // Reset
        } catch (error) {
            console.error(error);
            showNotification('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
        }
    };
    reader.readAsArrayBuffer(importFile);
  };

  // Teacher removes student from course
  const handleRemoveStudentFromCourse = (courseId, studentId) => {
      if(confirm('ต้องการลบนักเรียนคนนี้ออกจากรายวิชาใช่หรือไม่?')) {
          setEnrollments(prev => ({
              ...prev,
              [courseId]: prev[courseId].filter(id => id !== studentId)
          }));
          showNotification('ลบนักเรียนออกจากรายวิชาเรียบร้อย', 'success');
      }
  };

  const handleDeleteCourse = (e, id) => {
    e.stopPropagation();
    if (confirm('คุณต้องการลบรายวิชานี้ใช่หรือไม่?')) {
        setCourses(courses.filter(c => c.id !== id));
        showNotification('ลบรายวิชาสำเร็จ', 'error');
    }
  };
  
  const handleDeleteAssignment = (courseId, assignId) => {
    if (confirm('ต้องการลบหัวข้อคะแนนนี้ใช่หรือไม่? ข้อมูลคะแนนจะหายไป')) {
        const updated = (assignments[courseId] || []).filter(a => a.id !== assignId);
        setAssignments({ ...assignments, [courseId]: updated });
        showNotification('ลบหัวข้อคะแนนเรียบร้อย');
    }
  };

  const handleToggleHoliday = (date) => {
    setHolidays(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const handleSaveData = () => {
    showNotification('บันทึกข้อมูลเรียบร้อยแล้ว');
  };
  
  // ADDED: Admin delete student
  const handleDeleteStudent = (studentId) => {
      if(confirm('คุณต้องการลบนักเรียนคนนี้ออกจากฐานข้อมูลกลางหรือไม่? (ข้อมูลในทุกรายวิชาจะหายไป)')) {
          setStudents(prev => prev.filter(s => s.id !== studentId));
          showNotification('ลบนักเรียนเรียบร้อยแล้ว', 'success');
      }
  };
  
  // ADDED: Admin set user handlers
    const handleSetUser = (user, type) => {
        // ... (existing logic or define if missing)
    };
    const handleSaveUser = () => {
         // ...
    };
    const handleBulkSetPassword = () => {
         // ...
    };

  const filteredCourses = courses.filter(c => c.term === filterTerm && c.year === filterYear);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-[Sarabun]">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gradient-to-br from-[#1E3A8A] to-blue-900 p-10 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <img src={LOGO_URL} alt="Logo" className="w-32 h-32 mb-6 drop-shadow-xl animate-pulse-slow" />
             <h1 className="text-3xl font-bold mb-2 tracking-wide">วิทยาลัยการอาชีพ<br/>เวียงเชียงรุ้ง</h1>
             <p className="text-blue-200">ระบบบริหารจัดการชั้นเรียนออนไลน์</p>
          </div>
          <div className="md:w-1/2 p-10 flex flex-col justify-center bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">เข้าสู่ระบบ</h2>
            
            {!loginForm.role ? (
               <div className="space-y-4">
                  <p className="text-center text-gray-500 mb-4">กรุณาเลือกบทบาทของคุณ</p>
                  <div className="grid grid-cols-1 gap-3">
                     <button onClick={() => setLoginForm({...loginForm, role: 'teacher'})} className="p-4 border-2 border-gray-100 rounded-xl flex items-center hover:border-blue-500 hover:bg-blue-50 transition group"><div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-500 group-hover:text-white transition"><Users className="w-6 h-6 text-blue-600 group-hover:text-white" /></div><div className="text-left"><h3 className="font-bold text-gray-800">ครูผู้สอน</h3><p className="text-xs text-gray-400">สำหรับจัดการรายวิชาและคะแนน</p></div></button>
                     <button onClick={() => setLoginForm({...loginForm, role: 'student'})} className="p-4 border-2 border-gray-100 rounded-xl flex items-center hover:border-green-500 hover:bg-green-50 transition group"><div className="bg-green-100 p-3 rounded-lg mr-4 group-hover:bg-green-500 group-hover:text-white transition"><GraduationCap className="w-6 h-6 text-green-600 group-hover:text-white" /></div><div className="text-left"><h3 className="font-bold text-gray-800">นักเรียน</h3><p className="text-xs text-gray-400">สำหรับดูผลการเรียน</p></div></button>
                     <button onClick={() => setLoginForm({...loginForm, role: 'admin'})} className="p-4 border-2 border-gray-100 rounded-xl flex items-center hover:border-orange-500 hover:bg-orange-50 transition group"><div className="bg-orange-100 p-3 rounded-lg mr-4 group-hover:bg-orange-500 group-hover:text-white transition"><Shield className="w-6 h-6 text-orange-600 group-hover:text-white" /></div><div className="text-left"><h3 className="font-bold text-gray-800">ผู้ดูแลระบบ</h3><p className="text-xs text-gray-400">สำหรับจัดการระบบ</p></div></button>
                  </div>
               </div>
            ) : (
                <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                   <button type="button" onClick={() => setLoginForm({...loginForm, role: null})} className="text-sm text-gray-500 flex items-center mb-4 hover:text-blue-600"><ChevronLeft className="w-4 h-4 mr-1"/> เปลี่ยนบทบาท</button>
                   <div className="text-center mb-6"><span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase">{loginForm.role === 'teacher' ? 'ครูผู้สอน' : loginForm.role === 'student' ? 'นักเรียน' : 'ผู้ดูแลระบบ'}</span></div>

                   {(loginForm.role === 'teacher' || loginForm.role === 'student') && (
                     <>
                       <div><label className="text-gray-600 text-sm font-bold mb-1 block">ชื่อผู้ใช้งาน</label><div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} /></div></div>
                       <div><label className="text-gray-600 text-sm font-bold mb-1 block">รหัสผ่าน</label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="password" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} /></div></div>
                     </>
                   )}

                   {loginForm.role === 'admin' && (
                     <div><label className="text-gray-600 text-sm font-bold mb-1 block">รหัสผ่านผู้ดูแลระบบ</label><div className="relative"><Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="password" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="รหัสผ่าน" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} /></div></div>
                   )}
                   {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                   <button type="submit" className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-transform active:scale-95 shadow-lg">เข้าสู่ระบบ</button>
                </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-[Sarabun] overflow-hidden">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');`}</style>
      
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[#1E3A8A] text-white hidden md:flex flex-col shadow-2xl z-20 transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between border-b border-blue-800 h-16 bg-blue-900 relative">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'space-x-2'}`}>
             <img src={LOGO_URL} className="w-10 h-10 bg-white rounded-full p-0.5 shrink-0" />
             {!isSidebarCollapsed && <span className="font-bold text-lg tracking-wide whitespace-nowrap">WICE</span>}
          </div>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-6 bg-blue-600 text-white p-1 rounded-full shadow-md hover:bg-blue-500 z-50">
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
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
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}

        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 border-b border-gray-100">
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
          {currentPage === 'dashboard' && (
             <>
                {user.role === 'teacher' && <TeacherDashboard courses={courses} students={students} assignments={assignments} scores={scores} attendance={attendance} holidays={holidays} enrollments={enrollments} setEnrollments={setEnrollments} onNotify={showNotification} />}
                {user.role === 'student' && <StudentDashboard studentId={user.id} courses={courses} assignments={assignments} scores={scores} attendance={attendance} holidays={holidays} />}
                {user.role === 'admin' && <AdminDashboard students={students} teachers={teachers} setStudents={setStudents} onNotify={showNotification} />}
             </>
          )}

          {/* ... existing course views ... */}
          {/* Include other views here (courses list, add course modal, etc.) - same as before but ensured they exist in the full file context if needed, but for brevity assuming they are part of the full file replacement */}
          {/* Re-adding the missing parts for completeness in this single file block */}
          
          {currentPage === 'courses' && user.role === 'teacher' && !selectedCourse && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="flex space-x-4">
                    <div className="flex items-center space-x-2"><span className="text-sm font-bold text-gray-600">ภาคเรียน:</span><select value={filterTerm} onChange={e => setFilterTerm(e.target.value)} className="border rounded p-2 text-sm outline-none"><option value="1">1</option><option value="2">2</option><option value="Summer">Summer</option></select></div>
                    <div className="flex items-center space-x-2"><span className="text-sm font-bold text-gray-600">ปีการศึกษา:</span><input type="text" value={filterYear} onChange={e => setFilterYear(e.target.value)} className="border rounded p-2 text-sm w-24 text-center outline-none focus:ring-2 focus:ring-blue-500" placeholder="2567" /></div>
                 </div>
                 <button onClick={() => setIsAddCourseOpen(true)} className="bg-[#1E3A8A] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-transform hover:scale-105"><Plus className="w-5 h-5 mr-2" /> เพิ่มรายวิชา</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (<div className="col-span-full text-center py-20 text-gray-400">ไม่พบรายวิชาในภาคเรียนนี้</div>) : filteredCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group relative">
                    <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-500"></div><button onClick={(e) => handleDeleteCourse(e, course.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1 z-10 bg-white rounded-full shadow-sm"><Trash2 className="w-5 h-5"/></button>
                    <div className="p-6"><div className="flex justify-between items-center mb-3"><span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">{course.code}</span></div><h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-700 line-clamp-2 h-14">{course.name}</h3><p className="text-sm text-gray-500 mb-4 flex items-center"><Users className="w-4 h-4 mr-2 text-blue-400"/> {course.room} | {course.credits} หน่วยกิต</p><div className="bg-gray-50 p-3 rounded-lg mb-4 text-xs text-gray-600 flex justify-between"><div className="text-center"><div>K</div><div className="font-bold text-blue-600">{course.weights.knowledge}%</div></div><div className="text-center"><div>S</div><div className="font-bold text-orange-600">{course.weights.skill}%</div></div><div className="text-center"><div>A</div><div className="font-bold text-green-600">{course.weights.attitude}%</div></div></div><button onClick={() => setSelectedCourse(course)} className="w-full bg-white text-blue-600 border border-blue-200 py-2.5 rounded-lg hover:bg-blue-50 transition font-bold flex justify-center items-center">จัดการรายวิชา <ChevronRight className="w-4 h-4 ml-1" /></button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAddCourseOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
                      <div className="flex justify-between items-center mb-6 border-b pb-2"><h3 className="text-xl font-bold text-gray-800">เพิ่มรายวิชาใหม่</h3><button onClick={() => setIsAddCourseOpen(false)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6"/></button></div>
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500">รหัสวิชา</label><input type="text" className="w-full border p-2 rounded" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} /></div><div><label className="text-xs font-bold text-gray-500">ชื่อวิชา</label><input type="text" className="w-full border p-2 rounded" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} /></div></div>
                          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500">หน่วยกิต</label><input type="number" className="w-full border p-2 rounded" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: e.target.value})} /></div><div><label className="text-xs font-bold text-gray-500">ห้องเรียน</label><input type="text" className="w-full border p-2 rounded" value={newCourse.room} onChange={e => setNewCourse({...newCourse, room: e.target.value})} /></div></div>
                          <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500">ระดับชั้น</label><input type="text" className="w-full border p-2 rounded" value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value})} /></div><div><label className="text-xs font-bold text-gray-500">ปีการศึกษา</label><input type="text" className="w-full border p-2 rounded" value={newCourse.year} onChange={e => setNewCourse({...newCourse, year: e.target.value})} /></div></div>
                           <div><label className="text-xs font-bold text-gray-500">ภาคเรียน</label><select className="w-full border p-2 rounded" value={newCourse.term} onChange={e => setNewCourse({...newCourse, term: e.target.value})}><option value="1">1</option><option value="2">2</option><option value="Summer">Summer</option></select></div>
                          <div className="bg-blue-50 p-4 rounded-lg"><label className="text-xs font-bold text-blue-800 mb-2 block">สัดส่วนคะแนน (ต้องรวมได้ 100)</label><div className="flex gap-2"><div><span className="text-[10px] text-gray-500">ความรู้</span><input type="number" className="w-full border p-2 rounded text-center" value={newCourse.weights.knowledge} onChange={e => setNewCourse({...newCourse, weights: {...newCourse.weights, knowledge: Number(e.target.value)}})} /></div><div><span className="text-[10px] text-gray-500">ทักษะ</span><input type="number" className="w-full border p-2 rounded text-center" value={newCourse.weights.skill} onChange={e => setNewCourse({...newCourse, weights: {...newCourse.weights, skill: Number(e.target.value)}})} /></div><div><span className="text-[10px] text-gray-500">เจตคติ</span><input type="number" className="w-full border p-2 rounded text-center" value={newCourse.weights.attitude} onChange={e => setNewCourse({...newCourse, weights: {...newCourse.weights, attitude: Number(e.target.value)}})} /></div></div><div className="text-right text-xs mt-2 text-blue-600 font-bold">รวม: {newCourse.weights.knowledge + newCourse.weights.skill + newCourse.weights.attitude} คะแนน</div></div>
                          <button onClick={handleAddCourseSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">บันทึกรายวิชา</button>
                      </div>
                  </div>
              </div>
          )}

          {isAddStudentOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in"><div className="flex justify-between items-center mb-6 border-b pb-2"><h3 className="text-xl font-bold text-gray-800">เพิ่มนักเรียนใหม่</h3><button onClick={() => setIsAddStudentOpen(false)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6"/></button></div><div className="space-y-4"><div><label className="text-xs font-bold text-gray-500">รหัสนักเรียน</label><input type="text" className="w-full border p-2 rounded" value={newStudent.id} onChange={e => setNewStudent({...newStudent, id: e.target.value})} /></div><div><label className="text-xs font-bold text-gray-500">ชื่อ-สกุล</label><input type="text" className="w-full border p-2 rounded" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500">ระดับชั้น</label><input type="text" className="w-full border p-2 rounded" value={newStudent.level} onChange={e => setNewStudent({...newStudent, level: e.target.value})} /></div><div><label className="text-xs font-bold text-gray-500">ห้อง</label><input type="text" className="w-full border p-2 rounded" value={newStudent.room} onChange={e => setNewStudent({...newStudent, room: e.target.value})} /></div></div><button onClick={handleAddStudentSubmit} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">ยืนยัน</button></div></div></div>)}
          {isImportStudentOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in"><div className="flex justify-between items-center mb-6 border-b pb-2"><h3 className="text-xl font-bold text-purple-900 flex items-center"><Database className="w-6 h-6 mr-2" /> ค้นหาข้อมูลนักเรียนจากฐานข้อมูลกลาง</h3><button onClick={() => setIsImportStudentOpen(false)} className="text-gray-400 hover:text-red-500"><XCircle className="w-6 h-6"/></button></div><div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500 block mb-1">รหัสประจำตัว</label><input type="text" className="w-full border p-2 rounded bg-gray-50" value={importSearch.id} onChange={e => setImportSearch({...importSearch, id: e.target.value})} placeholder="ค้นหาด้วยรหัส..." /></div><div><label className="text-xs font-bold text-gray-500 block mb-1">ชื่อ-นามสกุล</label><input type="text" className="w-full border p-2 rounded bg-gray-50" value={importSearch.name} onChange={e => setImportSearch({...importSearch, name: e.target.value})} placeholder="ค้นหาด้วยชื่อ..." /></div><div><label className="text-xs font-bold text-gray-500 block mb-1">ระดับชั้น</label><input type="text" className="w-full border p-2 rounded bg-gray-50" value={importSearch.level} onChange={e => setImportSearch({...importSearch, level: e.target.value})} placeholder="เช่น ปวช. 2" /></div><div><label className="text-xs font-bold text-gray-500 block mb-1">ห้องเรียน</label><input type="text" className="w-full border p-2 rounded bg-gray-50" value={importSearch.room} onChange={e => setImportSearch({...importSearch, room: e.target.value})} placeholder="เช่น 1, 2" /></div></div><div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center justify-center h-32 text-purple-400">(พื้นที่แสดงผลการค้นหา)</div><div className="flex justify-end space-x-3 pt-2"><button onClick={() => setIsImportStudentOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">ยกเลิก</button><button onClick={handleImportStudentsSubmit} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-purple-700 flex items-center"><Search className="w-4 h-4 mr-2" /> ค้นหาและนำเข้า</button></div></div></div></div>)}

          {selectedCourse && (
            <div className="animate-fade-in pb-12">
              <button onClick={() => setSelectedCourse(null)} className="mb-4 text-sm text-gray-500 hover:text-blue-700 flex items-center font-bold"><ChevronLeft className="w-4 h-4 mr-1"/> กลับหน้ารายวิชา</button>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-h-[600px]">
                <div className="flex border-b overflow-x-auto">
                  {[{ id: 'students', label: 'รายชื่อนักเรียน', icon: Users, color: 'text-purple-600' }, { id: 'attendance', label: 'เวลาเรียน', icon: Clock, color: 'text-blue-600' }, { id: 'scores', label: 'คะแนนเก็บ', icon: Edit, color: 'text-orange-600' }, { id: 'behavior', label: 'บันทึกพฤติกรรม', icon: Flag, color: 'text-emerald-600' }, { id: 'behavior_sum', label: 'สรุปพฤติกรรม', icon: Award, color: 'text-indigo-600' }, { id: 'summary', label: 'สรุปผลการเรียน', icon: GraduationCap, color: 'text-pink-600' }].map(tab => (<button key={tab.id} onClick={() => setCurrentPage(tab.id)} className={`px-6 py-5 flex items-center whitespace-nowrap text-sm font-bold transition-all border-b-4 ${currentPage === tab.id || (tab.id === 'students' && !['attendance','scores','behavior','behavior_sum','summary'].includes(currentPage)) ? `border-${tab.color.split('-')[1]}-500 ${tab.color} bg-gray-50` : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}><tab.icon className={`w-4 h-4 mr-2 ${currentPage === tab.id ? tab.color : 'text-gray-400'}`} /> {tab.label}</button>))}
                </div>
                <div className="p-8">
                  {(!['attendance','scores','behavior','behavior_sum','summary'].includes(currentPage)) && (
                    <div className="space-y-6"><div className="flex flex-col md:flex-row justify-between items-center bg-purple-50 p-6 rounded-xl border border-purple-100"><div className="mb-4 md:mb-0"><h3 className="font-bold text-purple-900 text-lg">รายชื่อนักเรียน ({students.length})</h3><p className="text-purple-600 text-sm">จัดการข้อมูลนักเรียนในรายวิชานี้</p></div><div className="flex space-x-2"><button onClick={() => setIsAddStudentOpen(true)} className="bg-white text-purple-600 border border-purple-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-purple-100"><Plus className="w-4 h-4 mr-2"/> เพิ่มนักเรียนรายคน</button><button onClick={() => setIsImportStudentOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow hover:bg-purple-700"><Database className="w-4 h-4 mr-2" /> ดึงจากฐานข้อมูลกลาง</button></div></div><div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"><table className="w-full text-left"><thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold"><tr><th className="px-6 py-4">รหัส</th><th className="px-6 py-4">ชื่อ-สกุล</th><th className="px-6 py-4">ระดับชั้น</th><th className="px-6 py-4">ห้อง</th><th className="px-6 py-4 text-center">จัดการ</th></tr></thead><tbody className="divide-y divide-gray-100">
                    {/* Render students filtered by enrollment for this course */}
                    {students
                        .filter(s => (enrollments[selectedCourse.id] || []).includes(s.id))
                        .map(s => (
                        <tr key={s.id} className="hover:bg-purple-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-gray-500">{s.id}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">{s.name}</td>
                            <td className="px-6 py-4"><input type="text" className="border rounded px-2 py-1 w-24 bg-transparent focus:bg-white" defaultValue={s.level} /></td>
                            <td className="px-6 py-4"><input type="text" className="border rounded px-2 py-1 w-16 bg-transparent focus:bg-white" defaultValue={s.room} /></td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => handleRemoveStudentFromCourse(selectedCourse.id, s.id)} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody></table></div></div>
                  )}
                  {currentPage === 'attendance' && <AttendanceCheck students={students.filter(s => (enrollments[selectedCourse.id] || []).includes(s.id))} date={currentDate} setDate={setCurrentDate} attendance={attendance} onCheck={(sid, d, s) => setAttendance(prev => ({...prev, [sid]: {...(prev[sid]||{}), [d]: s}}))} onSave={handleSaveData} holidays={holidays} onToggleHoliday={handleToggleHoliday} />}
                  {currentPage === 'scores' && <ScoreManager students={students.filter(s => (enrollments[selectedCourse.id] || []).includes(s.id))} course={selectedCourse} assignments={assignments[selectedCourse.id] || []} scores={scores} onUpdateScore={(sid, aid, v, max) => setScores(p => ({...p, [sid]: {...(p[sid]||{}), [aid]: Math.min(Number(v), max)}}))} onAddAssignment={(cid, na) => setAssignments(p => ({...p, [cid]: [...(p[cid]||[]), {...na, id: 'as_'+Date.now()}]}))} onDeleteAssignment={handleDeleteAssignment} onSave={handleSaveData} />}
                  {currentPage === 'behavior' && <BehaviorManager students={students.filter(s => (enrollments[selectedCourse.id] || []).includes(s.id))} course={selectedCourse} behaviors={behaviors[selectedCourse.id] || behaviors[1]} behaviorRecords={behaviorRecords} onUpdateBehavior={(sid, date, bid) => setBehaviorRecords(prev => { const sRecs = prev[sid] || {}; const dRecs = sRecs[date] || []; const newRecs = dRecs.includes(bid) ? dRecs.filter(i => i!==bid) : [...dRecs, bid]; return {...prev, [sid]: {...sRecs, [date]: newRecs}}; })} onUpdateBehaviorsList={(newList) => setBehaviors(prev => ({...prev, [selectedCourse.id]: newList}))} onSave={handleSaveData} />}
                  {currentPage === 'behavior_sum' && <BehaviorSummary students={students.filter(s => (enrollments[selectedCourse.id] || []).includes(s.id))} behaviors={behaviors[selectedCourse.id] || behaviors[1]} behaviorRecords={behaviorRecords} maxAttitudeScore={selectedCourse.weights.attitude} />}
                  {currentPage === 'summary' && (<div className="space-y-6"><div className="flex justify-between items-center bg-pink-50 p-6 rounded-xl border border-pink-100"><div className="text-pink-800"><h3 className="font-bold text-lg mb-1">สรุปผลการเรียน (Grade Report)</h3><div className="text-sm opacity-80">Knowledge {selectedCourse.weights.knowledge}% | Skill {selectedCourse.weights.skill}% | Attitude {selectedCourse.weights.attitude}%</div></div><button className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-pink-700 flex items-center"><FileSpreadsheet className="w-5 h-5 mr-2" /> Export Excel</button></div><div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100"><table className="w-full text-sm text-left"><thead className="bg-gray-50 uppercase text-xs font-bold text-gray-600"><tr><th className="px-4 py-4 border-r">รหัส</th><th className="px-4 py-4 border-r min-w-[150px]">ชื่อ-สกุล</th><th className="px-2 py-4 text-center border-r">เวลาเรียน</th><th className="px-2 py-4 text-center border-r bg-blue-50 text-blue-800">K ({selectedCourse.weights.knowledge})</th><th className="px-2 py-4 text-center border-r bg-orange-50 text-orange-800">S ({selectedCourse.weights.skill})</th><th className="px-2 py-4 text-center border-r bg-green-50 text-green-800">A ({selectedCourse.weights.attitude})</th><th className="px-2 py-4 text-center border-r font-black text-gray-800 bg-gray-100">รวม (100)</th><th className="px-2 py-4 text-center font-black text-white bg-pink-500">เกรด</th></tr></thead><tbody className="divide-y divide-gray-100">{students.filter(s => (enrollments[selectedCourse.id] || []).includes(s.id)).map(std => { const stdScores = scores[std.id] || {}; const courseAssigns = assignments[selectedCourse.id] || []; let k=0, s=0; courseAssigns.forEach(assign => { const sc = Number(stdScores[assign.id] || 0); if(assign.type === 'knowledge') k += sc; if(assign.type === 'skill') s += sc; }); const a = calculateAttitudeScore(std.id, behaviors[selectedCourse.id] || behaviors[1], behaviorRecords, selectedCourse.weights.attitude); const total = k + s + a; const grade = calculateGrade(total, 100); return (<tr key={std.id} className="hover:bg-pink-50 transition-colors border-b"><td className="px-4 py-3 border-r font-mono text-gray-500">{std.id}</td><td className="px-4 py-3 border-r font-medium">{std.name}</td><td className="px-2 py-3 text-center border-r">100%</td><td className="px-2 py-3 text-center border-r font-bold text-blue-600 bg-blue-50">{k}</td><td className="px-2 py-3 text-center border-r font-bold text-orange-600 bg-orange-50">{s}</td><td className="px-2 py-3 text-center border-r font-bold text-green-600 bg-green-50">{a}</td><td className="px-2 py-3 text-center border-r font-black text-gray-800 bg-gray-100 text-lg">{total}</td><td className={`px-2 py-3 text-center font-black text-white ${grade === '0' || grade === 'ขร.' ? 'bg-red-500' : 'bg-green-500'}`}>{grade}</td></tr>) })}</tbody></table></div></div>)}
                </div>
              </div>
            </div>
          )}
        </div>
        <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-xs text-gray-400">
            ผู้พัฒนา : <span className="text-[#1E3A8A] font-bold">นายชาญชัย แก้วเถิน</span> | © 2024 Wiang Chiang Rung Industrial and Community Education College
        </footer>
      </main>
    </div>
  );
}