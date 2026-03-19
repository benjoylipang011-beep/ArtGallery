<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'total', 'status',
        'full_name', 'phone', 'address', 'payment_method',
        'tracking_note',
        'confirmed_at', 'shipped_at', 'delivered_at', 'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
        'shipped_at'   => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

    const STATUS_LABELS = [
        'pending'   => 'Order Placed',
        'confirmed' => 'Confirmed',
        'shipped'   => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function currentStepIndex(): int
    {
        if ($this->status === 'cancelled') return -1;
        $index = array_search($this->status, self::STEPS);
        return $index !== false ? $index : 0;
    }

    public function timeline(): array
    {
        $stepIndex = $this->currentStepIndex();

        return array_map(function ($step, $index) use ($stepIndex) {
            $timestampField = match ($step) {
                'pending'   => 'created_at',
                'confirmed' => 'confirmed_at',
                'shipped'   => 'shipped_at',
                'delivered' => 'delivered_at',
                default     => null,
            };

            $timestamp = $timestampField ? $this->{$timestampField} : null;

            return [
                'key'       => $step,
                'label'     => self::STATUS_LABELS[$step],
                'done'      => $stepIndex >= $index,
                'active'    => $stepIndex === $index,
                'timestamp' => $timestamp?->format('M d, Y h:i A'),
            ];
        }, self::STEPS, array_keys(self::STEPS));
    }
}