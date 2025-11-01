import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Settings, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PdfExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionPaper?: any; // Replace with your question paper type
}

export const PdfExportDialog = ({ open, onOpenChange, questionPaper }: PdfExportDialogProps) => {
  const { toast } = useToast();
  const [exportSettings, setExportSettings] = useState({
    paperSize: 'A4',
    orientation: 'portrait',
    includeHeader: true,
    includeFooter: true,
    includeAnswerKey: false,
    includeMarkingScheme: true,
    fontSize: 'medium',
    lineSpacing: 'normal',
    institutionName: '',
    examName: '',
    instructions: true,
  });

  const handleExport = () => {
    // Placeholder for API integration
    toast({
      title: "Export Ready",
      description: "PDF generation will be available after API integration.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Download className="h-6 w-6 text-primary" />
            Export Question Paper to PDF
          </DialogTitle>
          <DialogDescription>
            Customize your PDF export settings and preview before downloading
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Page Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Page Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paperSize">Paper Size</Label>
                    <Select
                      value={exportSettings.paperSize}
                      onValueChange={(value) =>
                        setExportSettings({ ...exportSettings, paperSize: value })
                      }
                    >
                      <SelectTrigger id="paperSize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select
                      value={exportSettings.orientation}
                      onValueChange={(value) =>
                        setExportSettings({ ...exportSettings, orientation: value })
                      }
                    >
                      <SelectTrigger id="orientation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Header & Footer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Header & Footer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Header</Label>
                    <p className="text-sm text-muted-foreground">
                      Show institution name and exam details
                    </p>
                  </div>
                  <Switch
                    checked={exportSettings.includeHeader}
                    onCheckedChange={(checked) =>
                      setExportSettings({ ...exportSettings, includeHeader: checked })
                    }
                  />
                </div>

                {exportSettings.includeHeader && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="institutionName">Institution Name</Label>
                      <Input
                        id="institutionName"
                        placeholder="Enter institution name"
                        value={exportSettings.institutionName}
                        onChange={(e) =>
                          setExportSettings({
                            ...exportSettings,
                            institutionName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="examName">Exam Name</Label>
                      <Input
                        id="examName"
                        placeholder="e.g., Mid-Term Examination 2024"
                        value={exportSettings.examName}
                        onChange={(e) =>
                          setExportSettings({
                            ...exportSettings,
                            examName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Footer</Label>
                    <p className="text-sm text-muted-foreground">
                      Show page numbers and footer text
                    </p>
                  </div>
                  <Switch
                    checked={exportSettings.includeFooter}
                    onCheckedChange={(checked) =>
                      setExportSettings({ ...exportSettings, includeFooter: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Instructions</Label>
                    <p className="text-sm text-muted-foreground">
                      Show exam instructions at the beginning
                    </p>
                  </div>
                  <Switch
                    checked={exportSettings.instructions}
                    onCheckedChange={(checked) =>
                      setExportSettings({ ...exportSettings, instructions: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Answer Key</Label>
                    <p className="text-sm text-muted-foreground">
                      Add answers on a separate page
                    </p>
                  </div>
                  <Switch
                    checked={exportSettings.includeAnswerKey}
                    onCheckedChange={(checked) =>
                      setExportSettings({ ...exportSettings, includeAnswerKey: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Marking Scheme</Label>
                    <p className="text-sm text-muted-foreground">
                      Add detailed marking rubrics
                    </p>
                  </div>
                  <Switch
                    checked={exportSettings.includeMarkingScheme}
                    onCheckedChange={(checked) =>
                      setExportSettings({
                        ...exportSettings,
                        includeMarkingScheme: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Formatting */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Formatting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select
                      value={exportSettings.fontSize}
                      onValueChange={(value) =>
                        setExportSettings({ ...exportSettings, fontSize: value })
                      }
                    >
                      <SelectTrigger id="fontSize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (10pt)</SelectItem>
                        <SelectItem value="medium">Medium (12pt)</SelectItem>
                        <SelectItem value="large">Large (14pt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lineSpacing">Line Spacing</Label>
                    <Select
                      value={exportSettings.lineSpacing}
                      onValueChange={(value) =>
                        setExportSettings({ ...exportSettings, lineSpacing: value })
                      }
                    >
                      <SelectTrigger id="lineSpacing">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact (1.0)</SelectItem>
                        <SelectItem value="normal">Normal (1.5)</SelectItem>
                        <SelectItem value="relaxed">Relaxed (2.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <Card className="min-h-[600px]">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-white border rounded-lg shadow-lg p-8 space-y-6">
                  {/* Preview Header */}
                  {exportSettings.includeHeader && (
                    <div className="text-center border-b pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {exportSettings.institutionName || '[Institution Name]'}
                      </h2>
                      <p className="text-lg text-gray-700 mt-2">
                        {exportSettings.examName || '[Exam Name]'}
                      </p>
                    </div>
                  )}

                  {/* Preview Instructions */}
                  {exportSettings.instructions && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Instructions:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Read all questions carefully before answering</li>
                        <li>Answer all questions in the provided space</li>
                        <li>Total marks: 100</li>
                        <li>Duration: 3 hours</li>
                      </ul>
                    </div>
                  )}

                  {/* Sample Question Preview */}
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4">
                      <p className="font-semibold text-gray-900">Q1. Sample Question</p>
                      <p className="text-gray-700 mt-2">
                        This is a preview of how your questions will appear in the PDF...
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">[5 marks]</p>
                    </div>
                  </div>

                  {/* Preview Footer */}
                  {exportSettings.includeFooter && (
                    <div className="border-t pt-4 text-center text-sm text-gray-500">
                      Page 1 of 1
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gradient-primary text-white">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
