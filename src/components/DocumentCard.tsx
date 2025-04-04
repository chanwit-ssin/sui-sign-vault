
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CalendarClock } from 'lucide-react';
import { Document } from '@/types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'signed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-sui-teal mr-2" />
            <CardTitle className="text-lg">{document.title}</CardTitle>
          </div>
          <Badge className={getStatusColor(document.status)}>
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-1">
          <CalendarClock className="w-4 h-4 mr-1 text-gray-400" />
          {format(document.uploadedAt, 'MMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-gray-600">
          {document.signatureFields.length > 0 ? (
            <p>
              {document.signatureFields.filter(field => field.signedBy).length} of {document.signatureFields.length} signatures completed
            </p>
          ) : (
            <p>No signature fields added yet</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/documents/${document.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Document
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
