"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 8

export function PaymentsPageAccepted() {
  const { paymentsAccepted, loading, addPayment, updatePayment, deletePayment, getPaymentVerifiedDetailById } = usePayments()
  const [searchQuery, setSearchQuery] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentFile | null>(null)
  const [participants, setParticipants] = useState<Record<string, PaymentDetail>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [cachedParticipants, setCachedParticipants] = useState<Record<string, PaymentDetail>>({})

  // Memoized filtered payments
  const filteredPayments = useMemo(() => {
    return paymentsAccepted.filter((payment) =>
      payment.participantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.filePath.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [paymentsAccepted, searchQuery])

  // Pagination calculations
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE)
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredPayments, currentPage])

  // Optimized participant data fetching
  const fetchParticipants = useCallback(async () => {
    const newParticipants: Record<string, PaymentDetail> = {}
    const paymentsToFetch = paginatedPayments.filter(payment => !cachedParticipants[payment.id])

    if (paymentsToFetch.length === 0) return

    try {
      const participantPromises = paymentsToFetch.map(async (payment) => {
        const data = await getPaymentVerifiedDetailById(payment.id)
        if (data) {
          newParticipants[payment.id] = data
        }
      })

      await Promise.all(participantPromises)
      
      setCachedParticipants(prev => ({ ...prev, ...newParticipants }))
    } catch (error) {
      console.error("Error fetching participant details:", error)
    }
  }, [paginatedPayments, cachedParticipants, getPaymentVerifiedDetailById])

  useEffect(() => {
    if (paginatedPayments.length > 0) {
      fetchParticipants()
    }
  }, [paginatedPayments, fetchParticipants])

  // Update displayed participants when cached data or pagination changes
  useEffect(() => {
    const displayedParticipants: Record<string, PaymentDetail> = {}
    paginatedPayments.forEach(payment => {
      if (cachedParticipants[payment.id]) {
        displayedParticipants[payment.id] = cachedParticipants[payment.id]
      }
    })
    setParticipants(displayedParticipants)
  }, [paginatedPayments, cachedParticipants])

  const handleEdit = (payment: PaymentFile) => {
    setEditingPayment(payment)
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      await deletePayment(id)
      // Clear cache for deleted payment
      setCachedParticipants(prev => {
        const newCache = { ...prev }
        delete newCache[id]
        return newCache
      })
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    let startPage = 1
    let endPage = totalPages

    if (totalPages > maxVisiblePages) {
      const half = Math.floor(maxVisiblePages / 2)
      startPage = Math.max(currentPage - half, 1)
      endPage = Math.min(currentPage + half, totalPages)

      if (currentPage <= half + 1) {
        endPage = maxVisiblePages
      } else if (currentPage >= totalPages - half) {
        startPage = totalPages - maxVisiblePages + 1
      }
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="first" onClick={() => handlePageChange(1)}>
          <PaginationLink>1</PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        items.push(<PaginationEllipsis key="ellipsis-start" />)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i} onClick={() => handlePageChange(i)}>
          <PaginationLink isActive={i === currentPage}>{i}</PaginationLink>
        </PaginationItem>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationEllipsis key="ellipsis-end" />)
      }
      items.push(
        <PaginationItem key="last" onClick={() => handlePageChange(totalPages)}>
          <PaginationLink>{totalPages}</PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  if (loading && paymentsAccepted.length === 0) {
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
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1) // Reset to first page when searching
          }}
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
              {paginatedPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{participants[payment.id]?.participant.name || 'Loading...'}</TableCell>
                    <TableCell>{participants[payment.id]?.class.name || 'Loading...'} {participants[payment.id]?.class.type || ''}</TableCell>
                    <TableCell>{participants[payment.id]?.participant.email || 'Loading...'}</TableCell>
                    <TableCell>{participants[payment.id]?.participant.phoneNumber || 'Loading...'}</TableCell>
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
                        }) : 'Loading...'}
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

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {renderPaginationItems()}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

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