import moment from 'moment-timezone';
import { KalenderKurikulumApi } from '~/apis'

export const checkKalender = async () => {
  const { session, update } = await useSession()

  if(session.value?.kalenderKurikulum?.jadwalBuka && session.value?.kalenderKurikulum?.jadwalTutup){

    // Set waktu saat ini ke UTC
    const now = moment().utc();

    // Konversi jadwal buka dan tutup ke UTC
    const startTime = moment.utc(session.value?.kalenderKurikulum?.jadwalBuka);
    const endTime = moment.utc(session.value?.kalenderKurikulum?.jadwalTutup);

    // Cek apakah sekarang di dalam rentang jadwal buka dan tutup
    if (now.isBetween(startTime, endTime)) {
      return { isOpen: true, message: 'Kalender masih dibuka' };
    } else {
      const message = now.isBefore(startTime)
        ? 'Kalender belum dibuka'
        : 'Kalender sudah ditutup';
      return { isOpen: false, message };
    }
  } else {
    return { isOpen: false, message: 'Kalender belum di-set' };
  }
};

export const setKalender = async (idProgramStudi: number) => {
  const { session, update } = await useSession()
  try{

    const token = session.value?.token
    if(!token) navigateTo('/logout')
      
    const result = await KalenderKurikulumApi.getByProdiKegiatan(idProgramStudi, 1, token)
    await update({ kalenderKurikulum: result })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}