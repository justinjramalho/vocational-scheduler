'use client';

import { useState, useEffect } from 'react';
import { Program, Student, StudentCohort } from '@/types';

const DEFAULT_PROGRAM_KEY = 'defaultProgramId';

interface UseProgramSelectionReturn {
  currentProgramId: string | null;
  defaultProgramId: string | null;
  currentProgramName: string;
  setCurrentProgram: (programId: string | null) => void;
  setDefaultProgram: (programId: string | null) => void;
  getFilteredStudents: (students: Student[]) => Student[];
  getFilteredCohorts: (cohorts: StudentCohort[]) => StudentCohort[];
  getFilteredPrograms: (programs: Program[]) => Program[];
}

export function useProgramSelection(programs: Program[]): UseProgramSelectionReturn {
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [defaultProgramId, setDefaultProgramId] = useState<string | null>(null);

  // Load default program from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDefaultId = sessionStorage.getItem(DEFAULT_PROGRAM_KEY);
      if (savedDefaultId && savedDefaultId !== 'null') {
        setDefaultProgramId(savedDefaultId);
        setCurrentProgramId(savedDefaultId);
      } else {
        // If no default is set, start with "All Programs"
        setCurrentProgramId(null);
      }
    }
  }, []);

  // Save default program to session storage
  const setDefaultProgram = (programId: string | null) => {
    setDefaultProgramId(programId);
    if (typeof window !== 'undefined') {
      if (programId === null) {
        sessionStorage.removeItem(DEFAULT_PROGRAM_KEY);
      } else {
        sessionStorage.setItem(DEFAULT_PROGRAM_KEY, programId);
      }
    }
  };

  // Set current program (for filtering)
  const setCurrentProgram = (programId: string | null) => {
    setCurrentProgramId(programId);
  };

  // Get current program name for display
  const currentProgramName = currentProgramId === null 
    ? 'All Programs' 
    : programs.find(p => p.id === currentProgramId)?.name || 'All Programs';

  // Filter students based on current program
  const getFilteredStudents = (students: Student[]): Student[] => {
    if (currentProgramId === null) {
      return students; // Show all students
    }
    
    const currentProgram = programs.find(p => p.id === currentProgramId);
    if (!currentProgram) {
      return students;
    }

    return students.filter(student => student.program === currentProgram.name);
  };

  // Filter cohorts based on current program
  const getFilteredCohorts = (cohorts: StudentCohort[]): StudentCohort[] => {
    if (currentProgramId === null) {
      return cohorts; // Show all cohorts
    }

    const currentProgram = programs.find(p => p.id === currentProgramId);
    if (!currentProgram) {
      return cohorts;
    }

    return cohorts.filter(cohort => cohort.programName === currentProgram.name);
  };

  // Filter programs based on current program (for Program Schedules section)
  const getFilteredPrograms = (programs: Program[]): Program[] => {
    if (currentProgramId === null) {
      return programs; // Show all programs
    }

    return programs.filter(program => program.id === currentProgramId);
  };

  return {
    currentProgramId,
    defaultProgramId,
    currentProgramName,
    setCurrentProgram,
    setDefaultProgram,
    getFilteredStudents,
    getFilteredCohorts,
    getFilteredPrograms,
  };
}
