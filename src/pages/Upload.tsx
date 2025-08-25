
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Save
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
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

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

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadProgress(100);
      
      // Start parsing
      setParsing(true);
      await parseFile(file);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const parseFile = async (file: File) => {
    try {
      // Mock AI parsing results - in real app, this would call OpenRouter API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockParsedData: ParsedData = {
        orders: [
          {
            external_id: "ORD-001",
            pickup_name: "Restaurant A",
            pickup_lat: 19.0760,
            pickup_lng: 72.8777,
            drop_name: "Customer 1",
            drop_lat: 19.0896,
            drop_lng: 72.8656,
            priority: 2,
            service_minutes: 5,
            weight: 1.2
          },
          {
            external_id: "ORD-002",
            pickup_name: "Restaurant B",
            pickup_lat: 19.0825,
            pickup_lng: 72.8751,
            drop_name: "Customer 2",
            drop_lat: 19.0945,
            drop_lng: 72.8712,
            priority: 1,
            service_minutes: 3,
            weight: 0.8
          },
          {
            external_id: "ORD-003",
            pickup_name: "Restaurant C",
            pickup_lat: 19.0712,
            pickup_lng: 72.8891,
            drop_name: "Customer 3",
            drop_lat: 19.0889,
            drop_lng: 72.8534,
            priority: 3,
            service_minutes: 4,
            weight: 1.5
          }
        ],
        partners: [
          {
            name: "Rahul Kumar",
            vehicle_type: "bike",
            capacity: 8,
            shift_start: "09:00",
            shift_end: "18:00"
          },
          {
            name: "Priya Singh",
            vehicle_type: "scooter",
            capacity: 12,
            shift_start: "10:00",
            shift_end: "19:00"
          }
        ],
        errors: [],
        warnings: [
          "Row 15: Missing time window for order ORD-015",
          "Row 23: Estimated coordinates for 'Andheri West' - please verify"
        ]
      };

      setParsedData(mockParsedData);
      
      toast({
        title: "File parsed successfully!",
        description: `Found ${mockParsedData.orders.length} orders and ${mockParsedData.partners.length} partners`,
      });
      
    } catch (error) {
      console.error('Parsing error:', error);
      toast({
        title: "Parsing failed",
        description: "AI parsing encountered an error. Please check your file format.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    
    try {
      // Here we would save to Supabase
      toast({
        title: "Data saved successfully!",
        description: `${parsedData.orders.length} orders and ${parsedData.partners.length} partners saved to database`,
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving the data",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-quantum-gradient rounded-lg">
            <UploadIcon className="w-6 h-6 text-white" />
          </div>
          Upload Orders
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload Excel or CSV files with AI-powered parsing and validation
        </p>
      </div>

      {!parsedData ? (
        <div className="space-y-6">
          {/* Upload Area */}
          <Card className="quantum-card">
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
                  disabled={uploading || parsing}
                />
                
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-quantum-gradient rounded-full flex items-center justify-center mx-auto">
                    {uploading || parsing ? (
                      <Sparkles className="w-8 h-8 text-white animate-quantum-pulse" />
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
                  ) : parsing ? (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">AI parsing in progress...</p>
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 animate-quantum-pulse" />
                        <span className="text-sm text-muted-foreground">
                          OpenRouter AI analyzing your data
                        </span>
                      </div>
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
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Powered Data Processing
              </CardTitle>
              <CardDescription>
                Our advanced AI system will automatically parse and validate your data
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
          <Card className="quantum-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success-gradient rounded-full flex items-center justify-center">
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
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button onClick={handleSave} className="quantum-gradient text-white gap-2">
                    <Save className="w-4 h-4" />
                    Save to Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {parsedData.warnings.length > 0 && (
            <Card className="quantum-card border-warning-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning-700">
                  <AlertCircle className="w-5 h-5" />
                  Warnings ({parsedData.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {parsedData.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-warning-700">
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Data Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="quantum-card">
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
                        <Badge className={`status-badge-new`}>
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

            <Card className="quantum-card">
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
                        <Badge className={`vehicle-badge-${partner.vehicle_type}`}>
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
