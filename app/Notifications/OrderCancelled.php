<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCancelled extends Notification
{
    use Queueable;

    public function __construct(
        protected Order $order,
        protected string $buyerName,
        protected string $artworkTitle,
        protected int $artworkId,
        protected ?string $reason = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'       => 'order_cancelled',
            'message'    => "{$this->buyerName} cancelled their order for \"{$this->artworkTitle}\".",
            'buyer_name' => $this->buyerName,
            'artwork'    => $this->artworkTitle,
            'action_url' => "/products/{$this->artworkId}",
            'reason'     => $this->reason,
        ];
    }
}