"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Plus, Search, Link2 } from "lucide-react"
import { usePayments } from "@/components/payment-provider"
import Link from "next/link"
import { PaymentFile, PaymentDetail, PaymentFileFormData } from "@/lib/types"

export function PaymentsPage() {
  const { payments, loading, addPayment, updatePayment, deletePayment, getPaymentDetailById } = usePayments()
  const [searchQuery, setSearchQuery] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentFile | null>(null)
  const [participants, setParticipants] = useState<Record<string, PaymentDetail>>({})

  const filteredPayments = payments.filter((payment) =>
    payment.participantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.filePath.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const fetchParticipants = async () => {
      const participantsData: Record<string, PaymentDetail> = {}

      for (const payment of payments) {
        const data = await getPaymentDetailById(payment.id)
        if (data) {
          participantsData[payment.id] = data
        }
      }

      setParticipants(participantsData)
    }

    if (payments.length > 0) {
      fetchParticipants()
    }
  }, [payments, getPaymentDetailById])

  const handleEdit = (payment: PaymentFile) => {
    setEditingPayment(payment)
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      await deletePayment(id)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <Button onClick={() => {
          setEditingPayment(null)
          setShowDialog(true)
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search payments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telephone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Date Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{participants[payment.id]?.participant.name || 'N/A'}</TableCell>
                    <TableCell>{participants[payment.id]?.class.name || 'N/A'} {participants[payment.id]?.class.type || 'N/A'}</TableCell>
                    <TableCell>{participants[payment.id]?.participant.email || 'N/A'}</TableCell>
                    <TableCell>{participants[payment.id]?.participant.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={payment.verified ? "default" : "secondary"}>
                        {payment.verified ? "Verified" : "Not Verified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={payment.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <Link2 size={16} />
                        File
                      </Link>
                    </TableCell>
                    <TableCell>
                      {participants[payment.id]?.participant.createdAt ?
                        new Date(Number(participants[payment.id]?.participant.createdAt)).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(payment)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(payment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      <PaymentDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) setEditingPayment(null)
        }}
        mode={editingPayment ? "edit" : "add"}
        paymentItem={editingPayment || undefined}
        onSubmit={async (data) => {
          if (editingPayment) {
            await updatePayment(editingPayment.id, data)
          } else {
            await addPayment(data)
          }
        }}
      />
    </div>
  )
}

function PaymentDialog({
  open,
  onOpenChange,
  mode,
  paymentItem,
  onSubmit
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  paymentItem?: PaymentFile
  onSubmit: (data: PaymentFileFormData) => Promise<void>
}) {
  const [formData, setFormData] = useState<PaymentFileFormData>({
    participantId: "",
    filePath: "",
    verified: false,
    verificationStatus: "pending",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (paymentItem) {
      setFormData({
        participantId: paymentItem.participantId,
        filePath: paymentItem.filePath,
        verified: paymentItem.verified,
        verificationStatus: paymentItem.verificationStatus,
      })
    } else {
      setFormData({ participantId: "", filePath: "", verified: false, verificationStatus: "pending" })
    }
  }, [paymentItem, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "verified" ? value === "true" : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit payment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add Payment File" : "Edit Payment File"}</DialogTitle>
            <DialogDescription>
              {mode === "add" ? "Enter new payment file details" : "Update the selected payment file"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="participantId">Participant ID</Label>
              <Input
                id="participantId"
                name="participantId"
                value={formData.participantId}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="filePath">File Path</Label>
              <Input
                id="filePath"
                name="filePath"
                value={formData.filePath}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="verified">Verified</Label>
              <select
                id="verified"
                name="verified"
                value={formData.verified.toString()}
                onChange={handleChange}
                className="w-full border rounded px-2 py-2"
                required
              >
                <option value="false">Not Verified</option>
                <option value="true">Verified</option>
              </select>
            </div>
            <div>
              <Label htmlFor="verificationStatus">Verification Status</Label>
              <select
                id="verificationStatus"
                name="verificationStatus"
                value={formData.verificationStatus}
                onChange={handleChange}
                className="w-full border rounded px-2 py-2"
                required
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="invalid">Invalid</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "add" ? "Add" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}