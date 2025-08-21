'use client';

import { useState, useEffect } from 'react';
import { Student, StudentCohort, StudentFormData } from '@/types';
import { studentsApi, cohortsApi } from '@/lib/services/api';
import StudentModal from './StudentModal';

interface StudentManagementProps {
  onAddAssignment: (studentId: string) => void;
  onViewSchedule: (studentId: string) => void;
}

export default function StudentManagement({ onAddAssignment, onViewSchedule }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [cohorts, setCohorts] = useState<StudentCohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter students based on cohort, grade, and search term
  useEffect(() => {
    let filtered = students.filter(student => student.active);
    
    if (selectedCohort !== 'all') {
      filtered = filtered.filter(student => student.cohortId === selectedCohort);
    }
    
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredStudents(filtered);
  }, [students, selectedCohort, selectedGrade, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [studentsData, cohortsData] = await Promise.all([
        studentsApi.getAll(),
        cohortsApi.getAll(),
      ]);
      
      setStudents(studentsData);
      setCohorts(cohortsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Get unique grades from students data
  const getUniqueGrades = () => {
    const grades = students
      .filter(student => student.active && student.grade)
      .map(student => student.grade)
      .filter((grade, index, array) => array.indexOf(grade) === index)
      .sort();
    return grades;
  };

  const handleCohortChange = async (studentId: string, newCohortId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const updatedData: StudentFormData = {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email || '',
        studentId: student.studentId || '',
        grade: student.grade || '',
        program: student.program || '',
        cohortId: newCohortId,
        notes: student.notes || '',
        emergencyContact: student.emergencyContact || '',
        accommodations: student.accommodations || [],
      };

      const updatedStudent = await studentsApi.update(studentId, updatedData);
      
      setStudents(prev => prev.map(s => 
        s.id === studentId ? updatedStudent : s
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
    }
  };

  const handleAddStudent = () => {
    setModalMode('add');
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setModalMode('edit');
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setModalMode('delete');
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: StudentFormData) => {
    try {
      if (modalMode === 'add') {
        const newStudent = await studentsApi.create(formData);
        setStudents(prev => [...prev, newStudent]);
      } else if (modalMode === 'edit' && selectedStudent) {
        const updatedStudent = await studentsApi.update(selectedStudent.id, formData);
        setStudents(prev => prev.map(student =>
          student.id === selectedStudent.id ? updatedStudent : student
        ));
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save student');
    }
  };

  const handleModalDelete = async () => {
    if (selectedStudent) {
      try {
        await studentsApi.delete(selectedStudent.id);
        setStudents(prev => prev.filter(student => student.id !== selectedStudent.id));
        setIsModalOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete student');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-700">Loading students...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadData();
                }}
                className="text-red-600 hover:text-red-500 text-sm font-medium mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header with Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
            <p className="text-gray-600 mt-1">Manage student rosters, cohorts, and schedules</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddStudent}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              + Add Student
            </button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
              📊 Import from Google Sheets
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              🎓 Import from Google Classroom
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Students
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="grade-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Grade
            </label>
            <select
              id="grade-filter"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Grades</option>
              {getUniqueGrades().map(grade => (
                <option key={grade} value={grade || ''}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="cohort-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Cohort
            </label>
            <select
              id="cohort-filter"
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Cohorts</option>
              {cohorts.map(cohort => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-end">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredStudents.length}</span> of <span className="font-medium">{students.filter(s => s.active).length}</span> students shown
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cohort
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  {/* Student Name + Add Assignment */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {student.fullName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {student.email}
                        </p>
                      </div>
                      <button
                        onClick={() => onAddAssignment(student.id)}
                        className="ml-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        + Assignment
                      </button>
                    </div>
                  </td>

                  {/* Student ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentId || 'N/A'}
                  </td>

                  {/* Grade */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.grade || 'N/A'}
                  </td>

                  {/* Cohort Dropdown */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={student.cohortId || ''}
                      onChange={(e) => handleCohortChange(student.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No Cohort</option>
                      {cohorts.map(cohort => (
                        <option key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* View Schedule */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewSchedule(student.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      View Schedule
                    </button>
                  </td>

                  {/* Edit/Delete */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-blue-600 hover:text-blue-900 transition-colors focus:outline-none focus:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="text-red-600 hover:text-red-900 transition-colors focus:outline-none focus:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCohort !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first student.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        mode={modalMode}
        student={selectedStudent}
        cohorts={cohorts}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={handleModalDelete}
      />
    </div>
  );
}