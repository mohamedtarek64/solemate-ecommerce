<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'order_id',
        'user_id',
        'type',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'due_date',
        'paid_at',
        'notes'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the user that owns the invoice.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order associated with the invoice.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the invoice items.
     */
    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Scope for paid invoices.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope for unpaid invoices.
     */
    public function scopeUnpaid($query)
    {
        return $query->whereIn('status', ['draft', 'pending', 'sent']);
    }

    /**
     * Scope for overdue invoices.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                    ->where('status', '!=', 'paid');
    }

    /**
     * Scope for specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Generate unique invoice number.
     */
    public static function generateInvoiceNumber()
    {
        do {
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('invoice_number', $invoiceNumber)->exists());

        return $invoiceNumber;
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid()
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now()
        ]);
    }

    /**
     * Mark invoice as sent.
     */
    public function markAsSent()
    {
        $this->update(['status' => 'sent']);
    }

    /**
     * Check if invoice is overdue.
     */
    public function isOverdue()
    {
        return $this->due_date &&
               $this->due_date->isPast() &&
               $this->status !== 'paid';
    }

    /**
     * Check if invoice is paid.
     */
    public function isPaid()
    {
        return $this->status === 'paid';
    }

    /**
     * Create invoice from order.
     */
    public static function createFromOrder($order)
    {
        $invoice = self::create([
            'invoice_number' => self::generateInvoiceNumber(),
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'type' => 'sale',
            'status' => 'draft',
            'subtotal' => $order->subtotal,
            'tax_amount' => $order->tax_amount,
            'discount_amount' => 0,
            'total_amount' => $order->total_amount,
            'due_date' => now()->addDays(30),
        ]);

        // Create invoice items from order items
        foreach ($order->orderItems as $orderItem) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'product_name' => $orderItem->product_name,
                'description' => "Size: {$orderItem->size}, Color: {$orderItem->color}",
                'quantity' => $orderItem->quantity,
                'unit_price' => $orderItem->price,
                'total_price' => $orderItem->price * $orderItem->quantity,
            ]);
        }

        return $invoice;
    }

    /**
     * Get invoice status in Arabic.
     */
    public function getStatusInArabic()
    {
        $statuses = [
            'draft' => 'Draft',
            'pending' => 'Pending',
            'sent' => 'Sent',
            'paid' => 'Paid',
            'cancelled' => 'Cancelled'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Get invoice type in Arabic.
     */
    public function getTypeInArabic()
    {
        $types = [
            'sale' => 'Sale Invoice',
            'return' => 'Return Invoice',
            'partial' => 'Partial Invoice',
            'supplier' => 'Supplier Invoice',
            'expense' => 'Expense Invoice'
        ];

        return $types[$this->type] ?? $this->type;
    }
}
