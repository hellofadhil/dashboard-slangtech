"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Filter,
  ArrowLeft,
  ArrowRightCircle,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useRouter } from "next/navigation";
import React from "react";
import { useEvents } from "@/components/events-provider";

export default function EventParticipantsPage({
  params,
}: {
  params: { id: string };
}) {
  const unwrappedParams = React.use(params);

  return (
    <DashboardLayout>
      <EventParticipantsView eventId={unwrappedParams.id} />
    </DashboardLayout>
  );
}

interface EventParticipantsViewProps {
  eventId: string;
}

export function EventParticipantsView({ eventId }: EventParticipantsViewProps) {
  const { getParticipantsByEventId, getEventById } = useEvents();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const data = await getParticipantsByEventId(eventId);
        setParticipants(data);
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId, getParticipantsByEventId]);

  const currentEvent = getEventById(eventId);

  // Filter participants based on search query and filters
  const filteredParticipants = participants.filter((participant) => {
    // Apply search filter
    if (
      searchQuery &&
      !participant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !participant.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Apply status filter
    if (statusFilter !== "all" && participant.status !== statusFilter) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center">
          Participants for: {currentEvent?.title || "Event"}
        </h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Education</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No participants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?name=${participant.name}&background=random`}
                              />
                              <AvatarFallback>
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {participant.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(
                                  participant.birthDate
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{participant.email}</div>
                            <div>{participant.phoneNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{participant.lastEducation}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              participant.status === "accepted"
                                ? "default"
                                : participant.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {participant.status.charAt(0).toUpperCase() +
                              participant.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(participant.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(
                                    `mailto:${participant.email}`,
                                    "_blank"
                                  )
                                }
                              >
                                Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(
                                    `tel:${participant.phoneNumber}`,
                                    "_blank"
                                  )
                                }
                              >
                                Call
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <ParticipantDetailDialog />
    </div>
  );
}

function ParticipantDetailDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Participant Details</DialogTitle>
          <DialogDescription>
            View detailed information about this participant
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Participant details would go here */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface Participant {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  birthDate: number;
  birthPlace: string;
  address: string;
  currentResidence: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  type: "event" | "class";
  lastEducation: string;
  eventId?: string;
  classId?: string;
  createdAt: number;
  updatedAt: number;
}