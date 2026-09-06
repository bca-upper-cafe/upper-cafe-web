'use client';

import React, { useState, useEffect } from 'react';
import { DuolingoButton } from '@/components/DuolingoButton';
import { DuolingoChoiceCard } from '@/components/DuolingoChoiceCard';
import { ActivePassCard } from '@/components/ActivePassCard';
import { CheckInRecord, CheckInScenario, TeacherAbsence, Academy } from '@/types';
import {
  fetchAbsences,
  createCheckIn,
  checkOutStudent,
  fetchCheckins,
} from '@/lib/api';
import {
  CalendarDays,
  UserX,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Search,
  Check,
  Sparkles,
  School,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx } from 'clsx';

const ACADEMIES: Academy[] = [
  'AAST',
  'AEDT',
  'AMST',
  'ABF',
  'ATCS',
  'ACAHA',
  'AVPA-M',
  'AVPA-T',
  'AVPA-V',
];

export default function StudentCheckInPage() {
  // Wizard state: 1 = Reason, 2 = Period & Teacher, 3 = Student Details, 4 = Active Pass
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [scenario, setScenario] = useState<CheckInScenario>('DEFAULT_STUDY_HALL');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(4);
  const [absentTeachers, setAbsentTeachers] = useState<TeacherAbsence[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherAbsence | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');

  // Form info
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [academy, setAcademy] = useState<Academy>('ATCS');
  const [grade, setGrade] = useState<'9' | '10' | '11' | '12'>('11');
  const [tableNumber, setTableNumber] = useState('Table 4');

  // Active pass state
  const [activePass, setActivePass] = useState<CheckInRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load active pass from localStorage if exists
  useEffect(() => {
    const savedPassId = localStorage.getItem('bca_upper_cafe_active_pass_id');
    if (savedPassId) {
      fetchCheckins('ACTIVE').then((activeList) => {
        const found = activeList.find((p) => p.id === savedPassId);
        if (found) {
          setActivePass(found);
        } else {
          localStorage.removeItem('bca_upper_cafe_active_pass_id');
        }
      });
    }
  }, []);

  // Fetch absences when step 2 is active
  useEffect(() => {
    fetchAbsences().then((list) => {
      setAbsentTeachers(list);
      if (list.length > 0 && !selectedTeacher) {
        // default select first teacher absent for current period if any
        const match = list.find((t) => t.periods.includes(selectedPeriod)) || list[0];
        setSelectedTeacher(match);
      }
    });
  }, [selectedPeriod]);

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (scenario === 'TEACHER_ABSENT' && !selectedTeacher) {
        setErrorMsg('Please select your absent teacher from the list.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const pass = await createCheckIn({
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim() || undefined,
        studentId: studentId.trim() || undefined,
        academy,
        grade,
        period: selectedPeriod,
        scenario,
        absentTeacherId: scenario === 'TEACHER_ABSENT' ? selectedTeacher?.id : undefined,
        absentTeacherName: scenario === 'TEACHER_ABSENT' ? selectedTeacher?.teacherName : undefined,
        tableNumber: tableNumber || `Table ${Math.floor(1 + Math.random() * 12)}`,
      });

      setActivePass(pass);
      localStorage.setItem('bca_upper_cafe_active_pass_id', pass.id);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#C5B358', '#E5D68A', '#10B981', '#ffffff'],
        });
      } catch (_err) {}
    } catch (_err) {
      setErrorMsg('Failed to check in. Please try again or ask study hall monitor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    await checkOutStudent(id);
    setActivePass(null);
    localStorage.removeItem('bca_upper_cafe_active_pass_id');
    setStep(1);
  };

  // If student already has an active pass, render pass view
  if (activePass) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 w-full">
        <ActivePassCard pass={activePass} onCheckOut={handleCheckOut} />
      </div>
    );
  }

  // Filter absent teachers based on period and search query
  const filteredTeachers = absentTeachers.filter((t) => {
    const matchesPeriod = t.periods.includes(selectedPeriod);
    const matchesQuery =
      t.teacherName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.department.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (t.room && t.room.toLowerCase().includes(teacherSearch.toLowerCase()));
    return matchesPeriod && matchesQuery;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10 w-full flex-1 flex flex-col justify-between">
      {/* Top Header & Duolingo-style Progress Bar */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={handlePrevStep}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#151B23] border border-[#2C3442] text-[#8B949E] hover:text-[#F0F6FC] hover:border-[#C5B358]/50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs font-black uppercase tracking-wider text-[#C5B358]">
              Step {step} of 3
            </span>
          </div>
          <span className="text-xs font-semibold text-[#8B949E]">
            {step === 1 && 'Select Reason'}
            {step === 2 && 'Period & Teacher'}
            {step === 3 && 'Student Details'}
          </span>
        </div>

        {/* Chunky Progress Line */}
        <div className="w-full bg-[#1F2631] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#2C3442] mb-8">
          <div
            className="h-full bg-gradient-to-r from-[#C5B358] to-[#E5D68A] rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* STEP 1: Reason Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-[#F0F6FC] tracking-tight">
                Why are you visiting Upper Cafe today?
              </h1>
              <p className="text-sm text-[#8B949E] mt-1.5 font-medium">
                Choose your check-in reason to comply with BCA attendance policies.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <DuolingoChoiceCard
                selected={scenario === 'DEFAULT_STUDY_HALL'}
                onClick={() => setScenario('DEFAULT_STUDY_HALL')}
                icon={<BookOpen className="w-7 h-7" />}
                title="Scheduled Study Hall"
                description="I have Upper Cafe Study Hall on my Genesis schedule for this period."
                badge="Regular"
              />

              <DuolingoChoiceCard
                selected={scenario === 'TEACHER_ABSENT'}
                onClick={() => setScenario('TEACHER_ABSENT')}
                icon={<UserX className="w-7 h-7" />}
                title="My Teacher is Absent"
                description="My class teacher is marked absent on the BCA absence list, and class reports to Upper Cafe."
                badge="Absence Coverage"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Period & Teacher Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F0F6FC] tracking-tight">
                What period is it?
              </h1>
              <p className="text-sm text-[#8B949E] mt-1.5 font-medium">
                Tap the period number you are checking in for.
              </p>
            </div>

            {/* Chunky 3D Period Buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => {
                const isSelected = selectedPeriod === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPeriod(p)}
                    className={clsx(
                      'flex flex-col items-center justify-center py-3 rounded-2xl font-black text-lg transition-all border-2 select-none active:translate-y-[2px]',
                      'border-b-[4px]',
                      isSelected
                        ? 'bg-[#C5B358] text-[#0B0E14] border-[#7A6B25] shadow-md shadow-[#C5B358]/20'
                        : 'bg-[#151B23] text-[#F0F6FC] border-[#2C3442] border-b-[#19202A] hover:border-[#3E4A5C]'
                    )}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">
                      P
                    </span>
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>

            {/* If Teacher Absent, select teacher */}
            {scenario === 'TEACHER_ABSENT' && (
              <div className="pt-3 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black uppercase tracking-wider text-[#C5B358]">
                    Select Absent Teacher for Period {selectedPeriod}
                  </label>
                  <span className="text-xs text-[#8B949E]">
                    {filteredTeachers.length} absent in P{selectedPeriod}
                  </span>
                </div>

                {/* Quick Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B949E]" />
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Search by teacher name or department..."
                    className="w-full bg-[#151B23] border-2 border-[#2C3442] focus:border-[#C5B358] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F0F6FC] outline-none transition-colors"
                  />
                </div>

                {/* Teacher List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredTeachers.length === 0 ? (
                    <div className="p-5 text-center bg-[#151B23]/70 rounded-2xl border border-dashed border-[#2C3442]">
                      <AlertCircle className="w-6 h-6 text-[#8B949E] mx-auto mb-1.5" />
                      <p className="text-sm font-bold text-[#F0F6FC]">
                        No absent teachers listed for Period {selectedPeriod}
                      </p>
                      <p className="text-xs text-[#8B949E] mt-1">
                        Try selecting another period or view the full list in the Absent Teachers tab.
                      </p>
                    </div>
                  ) : (
                    filteredTeachers.map((t) => {
                      const isTeacherSelected = selectedTeacher?.id === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTeacher(t)}
                          className={clsx(
                            'p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3',
                            'border-b-[3px]',
                            isTeacherSelected
                              ? 'bg-[#1F2631] border-[#C5B358] border-b-[#7A6B25] text-[#C5B358]'
                              : 'bg-[#151B23] border-[#2C3442] border-b-[#1A202A] text-[#F0F6FC] hover:border-[#3D4758]'
                          )}
                        >
                          <div>
                            <div className="font-extrabold text-sm">{t.teacherName}</div>
                            <div className="text-xs text-[#8B949E]">
                              {t.department} {t.room ? `• ${t.room}` : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0B0E14] text-[#E5D68A] border border-[#2C3442]">
                              P{t.periods.join(', ')}
                            </span>
                            {isTeacherSelected && <Check className="w-4 h-4 text-[#C5B358]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Student Details */}
        {step === 3 && (
          <form onSubmit={handleCheckInSubmit} className="space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F0F6FC] tracking-tight">
                Almost there! Who is checking in?
              </h1>
              <p className="text-sm text-[#8B949E] mt-1.5 font-medium">
                Enter your student details to generate your official study hall pass.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#8B949E] mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#151B23] border-2 border-[#2C3442] focus:border-[#C5B358] rounded-xl px-4 py-3 text-sm text-[#F0F6FC] outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#8B949E] mb-1.5">
                    BCA Email or ID #
                  </label>
                  <input
                    type="text"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g. aleriv26@bergen.org"
                    className="w-full bg-[#151B23] border-2 border-[#2C3442] focus:border-[#C5B358] rounded-xl px-4 py-3 text-sm text-[#F0F6FC] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#8B949E] mb-1.5">
                    Table / Seat
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Table 4"
                    className="w-full bg-[#151B23] border-2 border-[#2C3442] focus:border-[#C5B358] rounded-xl px-4 py-3 text-sm text-[#F0F6FC] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#8B949E] mb-1.5">
                    Academy
                  </label>
                  <select
                    value={academy}
                    onChange={(e) => setAcademy(e.target.value as Academy)}
                    className="w-full bg-[#151B23] border-2 border-[#2C3442] focus:border-[#C5B358] rounded-xl px-3 py-3 text-sm text-[#F0F6FC] outline-none transition-colors"
                  >
                    {ACADEMIES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#8B949E] mb-1.5">
                    Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full bg-[#151B23] border-2 border-[#2C3442] focus:border-[#C5B358] rounded-xl px-3 py-3 text-sm text-[#F0F6FC] outline-none transition-colors"
                  >
                    <option value="9">Freshman (Grade 9)</option>
                    <option value="10">Sophomore (Grade 10)</option>
                    <option value="11">Junior (Grade 11)</option>
                    <option value="12">Senior (Grade 12)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pass preview summary */}
            <div className="p-4 rounded-2xl bg-[#151B23] border border-[#2C3442] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8B949E]">Checking into:</span>
                <span className="font-extrabold text-[#F0F6FC]">
                  Upper Cafe • Period {selectedPeriod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B949E]">Reason:</span>
                <span className="font-extrabold text-[#C5B358]">
                  {scenario === 'DEFAULT_STUDY_HALL'
                    ? 'Scheduled Study Hall'
                    : `Absence: ${selectedTeacher?.teacherName || 'Teacher'}`}
                </span>
              </div>
            </div>
          </form>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar with Duolingo Buttons */}
      <div className="pt-8 border-t border-[#2C3442] mt-8 flex items-center justify-between gap-4">
        {step > 1 ? (
          <DuolingoButton variant="secondary" size="lg" onClick={handlePrevStep}>
            Back
          </DuolingoButton>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <DuolingoButton
            variant="primary"
            size="lg"
            onClick={handleNextStep}
            className="flex items-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </DuolingoButton>
        ) : (
          <DuolingoButton
            variant="primary"
            size="lg"
            disabled={submitting}
            onClick={handleCheckInSubmit}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Checking In...' : 'Get Upper Cafe Pass'}</span>
          </DuolingoButton>
        )}
      </div>
    </div>
  );
}
