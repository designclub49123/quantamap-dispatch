
import { createClient } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export interface UploadResult {
  success: boolean;
  data?: {
    orders: any[];
    partners: any[];
    warnings: string[];
  };
  error?: string;
}

export async function uploadAndParseFile(file: File): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    console.log('Starting file upload process for:', file.name);
    
    // Upload file to Supabase storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    console.log('File uploaded successfully, now parsing...');

    // Parse file content based on type
    let parsedData;
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      parsedData = await parseExcelFile(file);
    } else if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      const fileContent = await readFileAsText(file);
      parsedData = parseCSVContent(fileContent);
    } else {
      return { success: false, error: 'Unsupported file format' };
    }
    
    console.log('File parsed successfully:', parsedData);
    
    return {
      success: true,
      data: parsedData
    };
  } catch (error) {
    console.error('File upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to process file' 
    };
  }
}

async function parseExcelFile(file: File) {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('Excel workbook sheets:', workbook.SheetNames);
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Excel data converted to JSON:', jsonData);
        
        // Parse the JSON data
        const parsedData = parseSheetData(jsonData as any[][]);
        resolve(parsedData);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function parseSheetData(data: any[][]) {
  if (!data || data.length < 2) {
    return { orders: [], partners: [], warnings: ['File appears to be empty or has no data rows'] };
  }
  
  const headers = data[0].map((h: any) => String(h).toLowerCase().trim());
  console.log('Headers found:', headers);
  
  const orders = [];
  const partners = [];
  const warnings = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    // Create an object from the row data
    const rowObj: any = {};
    headers.forEach((header, index) => {
      if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
        rowObj[header] = row[index];
      }
    });

    // Skip empty rows
    if (Object.keys(rowObj).length === 0) continue;

    // Determine if this is an order or partner based on available fields
    const hasOrderFields = headers.some(h => 
      ['pickup_name', 'pickup_lat', 'drop_name', 'drop_lat', 'order_id', 'external_id'].includes(h)
    );
    
    const hasPartnerFields = headers.some(h => 
      ['name', 'vehicle_type', 'capacity', 'partner_name', 'driver_name'].includes(h)
    );

    if (hasOrderFields && (rowObj.pickup_name || rowObj.drop_name)) {
      // This looks like an order
      const order: any = {
        external_id: rowObj.external_id || rowObj.order_id || `ORD-${i.toString().padStart(3, '0')}`,
        pickup_name: rowObj.pickup_name || 'Unknown Pickup',
        pickup_lat: parseFloat(rowObj.pickup_lat) || 19.0760,
        pickup_lng: parseFloat(rowObj.pickup_lng) || 72.8777,
        drop_name: rowObj.drop_name || 'Unknown Drop',
        drop_lat: parseFloat(rowObj.drop_lat) || 19.0896,
        drop_lng: parseFloat(rowObj.drop_lng) || 72.8656,
        priority: parseInt(rowObj.priority) || 3,
        service_minutes: parseInt(rowObj.service_minutes) || 5,
        weight: parseFloat(rowObj.weight) || 1.0
      };

      // Add time windows if available
      if (rowObj.tw_start) order.tw_start = rowObj.tw_start;
      if (rowObj.tw_end) order.tw_end = rowObj.tw_end;

      orders.push(order);
      
      // Add warnings for missing coordinates
      if (!rowObj.pickup_lat || !rowObj.pickup_lng) {
        warnings.push(`Row ${i + 1}: Missing pickup coordinates for ${order.external_id}`);
      }
      if (!rowObj.drop_lat || !rowObj.drop_lng) {
        warnings.push(`Row ${i + 1}: Missing drop coordinates for ${order.external_id}`);
      }
    } else if (hasPartnerFields && (rowObj.name || rowObj.partner_name || rowObj.driver_name)) {
      // This looks like a partner
      const partner: any = {
        name: rowObj.name || rowObj.partner_name || rowObj.driver_name,
        vehicle_type: (rowObj.vehicle_type || 'bike').toLowerCase(),
        capacity: parseInt(rowObj.capacity) || 8,
        shift_start: rowObj.shift_start || '09:00',
        shift_end: rowObj.shift_end || '18:00'
      };

      // Validate vehicle type
      const validVehicleTypes = ['bike', 'scooter', 'car', 'van', 'truck'];
      if (!validVehicleTypes.includes(partner.vehicle_type)) {
        partner.vehicle_type = 'bike';
        warnings.push(`Row ${i + 1}: Invalid vehicle type for ${partner.name}, defaulted to 'bike'`);
      }

      partners.push(partner);
    }
  }

  console.log('Parsed data:', { orders: orders.length, partners: partners.length, warnings: warnings.length });
  
  return { orders, partners, warnings };
}

function parseCSVContent(content: string) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return { orders: [], partners: [], warnings: ['CSV file appears to be empty or has no data rows'] };
  }
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  console.log('CSV Headers found:', headers);
  
  const data = [headers];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    data.push(values);
  }
  
  return parseSheetData(data);
}
