import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { db, COLLECTIONS, UserDocument, JobDocument, ApplicationDocument, JOB_STATUS, APPLICATION_STATUS } from '../config/firebase';

export const createUser = async (userId: string, userData: Omit<UserDocument, 'uid'>) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await setDoc(userRef, {
    uid: userId,
    ...userData,
  });
};

export const getUser = async (userId: string) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserDocument : null;
};

export const updateUser = async (userId: string, userData: Partial<UserDocument>) => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, userData);
};

/**
 * Creates a new job posting in the database with PENDING status
 * All new jobs require admin approval before being visible to students
 * @param jobData - Job information without id, timestamps, or status
 * @returns The newly created job document
 */
export const createJob = async (jobData: Omit<JobDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const jobRef = doc(collection(db, COLLECTIONS.JOBS)); // Generate a new document reference with auto-ID
  const now = new Date().toISOString();
  
  // Process requirements to ensure it's an array
  let requirements: string[] = [];
  const reqField = jobData.requirements as string | string[] | undefined;
  
  if (reqField) {
    if (typeof reqField === 'string') {
      requirements = reqField.split('\n').filter(Boolean);
    } else if (Array.isArray(reqField)) {
      requirements = reqField;
    }
  }
  
  const newJob: JobDocument = {
    id: jobRef.id,
    ...jobData,
    requirements, // Use the processed requirements array
    status: JOB_STATUS.PENDING, // All new jobs start as pending for admin approval
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(jobRef, newJob); // Save to Firestore
  return newJob;
};

export const getJob = async (jobId: string) => {
  const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
  const jobSnap = await getDoc(jobRef);
  return jobSnap.exists() ? jobSnap.data() as JobDocument : null;
};

/**
 * Updates an existing job document, including changing its approval status
 * Used when admins approve or reject jobs in the AdminPanel
 * @param jobId - The ID of the job to update
 * @param jobData - Partial job data with fields to update
 */
export const updateJob = async (jobId: string, jobData: Partial<JobDocument>) => {
  const jobRef = doc(db, COLLECTIONS.JOBS, jobId); // Get reference to the job document
  const updates = {
    ...jobData,
    updatedAt: new Date().toISOString(), // Always update the timestamp
  };
  await updateDoc(jobRef, updates); // Update job in Firestore
};

export const deleteJob = async (jobId: string) => {
  const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
  await deleteDoc(jobRef);
};

/**
 * Retrieves all job postings with APPROVED status
 * Only approved jobs are shown to students in the job listings
 * @returns Array of approved job documents sorted by creation date (newest first)
 */
export const getApprovedJobs = async () => {
  const jobsRef = collection(db, COLLECTIONS.JOBS);
  const q = query(
    jobsRef,
    where('status', '==', JOB_STATUS.APPROVED), // Only fetch approved jobs
    orderBy('createdAt', 'desc') // Sort newest first
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as JobDocument);
};

/**
 * Retrieves all job postings with PENDING status that need admin approval
 * These jobs are shown in the AdminPanel for admins to review
 * Note: This query requires a Firestore composite index to work properly
 * @returns Array of pending job documents sorted by creation date (newest first)
 */
export const getPendingJobs = async () => {
  const jobsRef = collection(db, COLLECTIONS.JOBS);
  const q = query(
    jobsRef,
    where('status', '==', JOB_STATUS.PENDING), // Only fetch pending jobs
    orderBy('createdAt', 'desc') // Sort newest first
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as JobDocument);
};

export const createApplication = async (applicationData: Omit<ApplicationDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const applicationRef = doc(collection(db, COLLECTIONS.APPLICATIONS));
  const now = new Date().toISOString();
  
  const newApplication: ApplicationDocument = {
    id: applicationRef.id,
    ...applicationData,
    status: APPLICATION_STATUS.PENDING,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(applicationRef, newApplication);
  return newApplication;
};

export const getApplication = async (applicationId: string) => {
  const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
  const applicationSnap = await getDoc(applicationRef);
  return applicationSnap.exists() ? applicationSnap.data() as ApplicationDocument : null;
};

export const updateApplication = async (applicationId: string, applicationData: Partial<ApplicationDocument>) => {
  const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
  const updates = {
    ...applicationData,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(applicationRef, updates);
};

export const getApplicationsByEmployer = async (employerId: string) => {
  const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
  const q = query(
    applicationsRef,
    where('employerId', '==', employerId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as ApplicationDocument);
};

export const getApplicationsByStudent = async (studentId: string) => {
  const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
  const q = query(
    applicationsRef,
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as ApplicationDocument);
};

export const getApplicationsByJob = async (jobId: string) => {
  const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
  const q = query(
    applicationsRef,
    where('jobId', '==', jobId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as ApplicationDocument);
};
