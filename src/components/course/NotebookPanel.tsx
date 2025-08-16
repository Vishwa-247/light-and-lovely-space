import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import MindMap from './MindMap';

interface KeyConcept {
  term: string;
  definition: string;
}

interface NotebookData {
  keyConcepts: KeyConcept[];
  analogy: string;
}

interface MindMapData {
  root: {
    name: string;
    children?: any[];
  };
}

interface NotebookPanelProps {
  notebook: NotebookData;
  mindMap: MindMapData;
}

const NotebookPanel: React.FC<NotebookPanelProps> = ({ notebook, mindMap }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Learning Notebook</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="concepts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
            <TabsTrigger value="concepts">Key Concepts</TabsTrigger>
            <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
            <TabsTrigger value="analogy">Analogy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="concepts" className="px-4 pb-4">
            <div className="space-y-4">
              {notebook.keyConcepts.map((concept, index) => (
                <div key={index} className="space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    {concept.term}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {concept.definition}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="mindmap" className="px-4 pb-4">
            <div className="w-full">
              <MindMap data={mindMap} />
            </div>
          </TabsContent>
          
          <TabsContent value="analogy" className="px-4 pb-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Real-World Analogy</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {notebook.analogy}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotebookPanel;