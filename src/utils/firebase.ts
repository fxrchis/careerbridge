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

export const createJob = async (jobData: Omit<JobDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const jobRef = doc(collection(db, COLLECTIONS.JOBS));
  const now = new Date().toISOString();
  
  const newJob: JobDocument = {
    id: jobRef.id,
    ...jobData,
    status: JOB_STATUS.PENDING,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(jobRef, newJob);
  return newJob;
};

export const getJob = async (jobId: string) => {
  const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
  const jobSnap = await getDoc(jobRef);
  return jobSnap.exists() ? jobSnap.data() as JobDocument : null;
};

export const updateJob = async (jobId: string, jobData: Partial<JobDocument>) => {
  const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
  const updates = {
    ...jobData,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(jobRef, updates);
};

export const deleteJob = async (jobId: string) => {
  const jobRef = doc(db, COLLECTIONS.JOBS, jobId);
  await deleteDoc(jobRef);
};

export const getApprovedJobs = async () => {
  const jobsRef = collection(db, COLLECTIONS.JOBS);
  const q = query(
    jobsRef,
    where('status', '==', JOB_STATUS.APPROVED),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as JobDocument);
};

export const getPendingJobs = async () => {
  const jobsRef = collection(db, COLLECTIONS.JOBS);
  const q = query(
    jobsRef,
    where('status', '==', JOB_STATUS.PENDING),
    orderBy('createdAt', 'desc')
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
