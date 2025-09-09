
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { uploadAndParseFile, UploadResult } from '@/lib/fileUpload';
import { initializeStorage } from '@/lib/supabaseStorage';
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Save,
  Play
} from "lucide-react";

interface ParsedData {
  orders: any[];
  partners: any[];
  errors: string[];
  warnings: string[];
}

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [creatingJob, setCreatingJob] = useState(false);
  const { toast } = useToast();

  // Initialize storage on component mount
  useEffect(() => {
    initializeStorage();
  }, []);

  const downloadDemoFile = () => {
    // Create demo CSV content
    const demoOrders = `external_id,pickup_name,pickup_lat,pickup_lng,drop_name,drop_lat,drop_lng,priority,weight,service_minutes
ORD-001,Restaurant A,19.0760,72.8777,Customer Location 1,19.0896,72.8656,1,2.5,10
ORD-002,Restaurant B,19.1136,72.8697,Customer Location 2,19.0330,72.8570,2,1.8,8
ORD-003,Restaurant C,19.0500,72.8500,Customer Location 3,19.1200,72.9000,3,3.2,12
ORD-004,Restaurant D,19.0800,72.8800,Customer Location 4,19.0400,72.8400,1,1.5,6
ORD-005,Restaurant E,19.0900,72.8900,Customer Location 5,19.0600,72.8600,2,2.1,9`;

    const demoPartners = `name,vehicle_type,capacity,shift_start,shift_end,phone,email
Rahul Kumar,bike,8,09:00,18:00,+91-9876543210,rahul@example.com
Priya Singh,scooter,12,10:00,19:00,+91-9876543211,priya@example.com
Amit Patel,car,20,08:00,17:00,+91-9876543212,amit@example.com`;

    // Create workbook with multiple sheets
    const csvContent = `Orders Sheet:\n${demoOrders}\n\nPartners Sheet:\n${demoPartners}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-orders-partners.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Demo file downloaded!",
      description: "You can now upload this file to test the AI parsing functionality",
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };


  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Fast validation checks first
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive"
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10485760) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setParsedData(null);

    try {
      // Use the existing uploadAndParseFile function which handles both upload and parsing
      setUploadProgress(10);
      
      const result: UploadResult = await uploadAndParseFile(file);
      
      setUploadProgress(100);
      
      if (result.success && result.data) {
        setParsedData({
          orders: result.data.orders || [],
          partners: result.data.partners || [],
          errors: [],
          warnings: result.data.warnings || []
        });
        
        toast({
          title: "File uploaded and parsed successfully!",
          description: `Found ${result.data.orders?.length || 0} orders and ${result.data.partners?.length || 0} partners`,
        });
      } else {
        throw new Error(result.error || "Failed to process file");
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "There was an error processing your file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    
    try {
      console.log('Saving parsed data to database...');
      
      // Save orders to database
      if (parsedData.orders.length > 0) {
        const { error: ordersError } = await supabase
          .from('orders')
          .insert(parsedData.orders.map(order => ({
            ...order,
            org_id: '00000000-0000-0000-0000-000000000000' // Default org for demo
          })));
        
        if (ordersError) {
          console.error('Error saving orders:', ordersError);
          throw ordersError;
        }
      }
      
      // Save partners to database
      if (parsedData.partners.length > 0) {
        const { error: partnersError } = await supabase
          .from('delivery_partners')
          .insert(parsedData.partners.map(partner => ({
            ...partner,
            org_id: '00000000-0000-0000-0000-000000000000' // Default org for demo
          })));
        
        if (partnersError) {
          console.error('Error saving partners:', partnersError);
          throw partnersError;
        }
      }
      
      toast({
        title: "Data saved successfully!",
        description: `${parsedData.orders.length} orders and ${parsedData.partners.length} partners saved to database`,
      });
      
      // Reset the form after successful save
      setParsedData(null);
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving the data to the database",
        variant: "destructive"
      });
    }
  };

  const handleCreateJob = async () => {
    if (!parsedData) return;

    try {
      setCreatingJob(true);
      
      // Create a new optimization job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          org_id: '00000000-0000-0000-0000-000000000000',
          name: `Optimization Job - ${new Date().toLocaleDateString()}`,
          status: 'pending',
          total_orders: parsedData.orders.length,
          assigned_partners: parsedData.partners.length,
          optimization_type: 'route'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      toast({
        title: "Optimization job created!",
        description: "Redirecting to jobs page to monitor progress...",
      });

      // Redirect to jobs page
      setTimeout(() => {
        window.location.href = '/jobs';
      }, 2000);

    } catch (error) {
      console.error('Job creation error:', error);
      toast({
        title: "Job creation failed",
        description: "There was an error creating the optimization job",
        variant: "destructive"
      });
    } finally {
      setCreatingJob(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <UploadIcon className="w-6 h-6 text-white" />
          </div>
          Upload Orders
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload Excel or CSV files with automatic parsing and validation
        </p>
      </div>


      {!parsedData ? (
        <div className="space-y-6">
          {/* Demo File Download */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Demo File</h3>
                  <p className="text-muted-foreground">
                    Download a sample CSV file to test the parsing functionality
                  </p>
                </div>
                <Button variant="outline" onClick={downloadDemoFile} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download Demo File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card>
            <CardContent className="p-8">
              <div
                className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    {uploading ? (
                      <Sparkles className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  {uploading ? (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Uploading file...</p>
                      <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                      <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium">Drop your Excel or CSV file here</h3>
                      <p className="text-muted-foreground">
                        or click to browse files
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <Badge variant="secondary">.xlsx</Badge>
                        <Badge variant="secondary">.xls</Badge>
                        <Badge variant="secondary">.csv</Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Powered Data Processing
              </CardTitle>
              <CardDescription>
                Our advanced AI system will automatically parse and validate your data using Qwen 2.5 7B Instruct
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Orders Data Expected:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Order ID / External ID</li>
                    <li>• Pickup location (name + coordinates)</li>
                    <li>• Drop location (name + coordinates)</li>
                    <li>• Priority (optional)</li>
                    <li>• Time windows (optional)</li>
                    <li>• Weight/Size (optional)</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Partners Data (Optional):</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Partner name</li>
                    <li>• Vehicle type (bike/scooter/car/van/truck)</li>
                    <li>• Capacity</li>
                    <li>• Shift timings</li>
                    <li>• Special notes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Parsing Complete!</h3>
                    <p className="text-muted-foreground">
                      {parsedData.orders.length} orders and {parsedData.partners.length} partners processed
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white gap-2">
                    <Save className="w-4 h-4" />
                    Save to Database
                  </Button>
                  <Button 
                    onClick={handleCreateJob} 
                    disabled={creatingJob}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {creatingJob ? 'Creating...' : 'Create Optimization Job'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {parsedData.warnings.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="w-5 h-5" />
                  Warnings ({parsedData.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {parsedData.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-orange-700">
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Data Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders ({parsedData.orders.length})</CardTitle>
                <CardDescription>Parsed order data preview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {parsedData.orders.slice(0, 5).map((order, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{order.external_id}</span>
                        <Badge variant="secondary">
                          Priority {order.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.pickup_name} → {order.drop_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Weight: {order.weight}kg, Service: {order.service_minutes}min
                      </p>
                    </div>
                  ))}
                  {parsedData.orders.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... and {parsedData.orders.length - 5} more orders
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Partners ({parsedData.partners.length})</CardTitle>
                <CardDescription>Parsed partner data preview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {parsedData.partners.map((partner, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{partner.name}</span>
                        <Badge variant="outline">
                          {partner.vehicle_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Capacity: {partner.capacity} orders
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Shift: {partner.shift_start} - {partner.shift_end}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
