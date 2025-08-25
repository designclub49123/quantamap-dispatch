
import { supabase } from '@/integrations/supabase/client';

export async function initializeStorage() {
  try {
    // Check if uploads bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const uploadsBucket = buckets?.find(bucket => bucket.name === 'uploads');
    
    if (!uploadsBucket) {
      const { error } = await supabase.storage.createBucket('uploads', {
        public: false,
        allowedMimeTypes: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'
        ],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.error('Failed to create uploads bucket:', error);
      }
    }
  } catch (error) {
    console.error('Storage initialization error:', error);
  }
}
