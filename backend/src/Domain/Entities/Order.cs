using GrouponClone.Domain.Enums;
using GrouponClone.Domain.Events;
using GrouponClone.Domain.Exceptions;

namespace GrouponClone.Domain.Entities;

public class Order : BaseEntity
{
    public Guid UserId { get; private set; }
    public string OrderNumber { get; private set; } = default!;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public decimal Subtotal { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "USD";
    public string? PromoCode { get; private set; }
    public string? StripePaymentIntentId { get; private set; }
    public DateTime? PaidAt { get; private set; }

    private readonly List<OrderItem> _items = [];
    private readonly List<Voucher> _vouchers = [];
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public IReadOnlyCollection<Voucher> Vouchers => _vouchers.AsReadOnly();
    public Payment? Payment { get; private set; }

    protected Order() { }

    public static Order Create(Guid userId, string orderNumber, List<OrderItem> items,
        decimal discountAmount = 0, decimal taxAmount = 0, string? promoCode = null)
    {
        if (items.Count == 0) throw new DomainException("Order must contain at least one item.");

        var subtotal = items.Sum(i => i.TotalPrice);
        var total = subtotal - discountAmount + taxAmount;
        if (total < 0) total = 0;

        var order = new Order
        {
            UserId = userId,
            OrderNumber = orderNumber,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            TaxAmount = taxAmount,
            TotalAmount = total,
            PromoCode = promoCode,
        };
        order._items.AddRange(items);
        order.AddDomainEvent(new OrderCreatedEvent(order.Id, userId, total));
        return order;
    }

    public void SetPaymentIntent(string paymentIntentId)
    {
        StripePaymentIntentId = paymentIntentId;
        SetUpdated();
    }

    public void MarkPaid(string paymentIntentId)
    {
        if (Status != OrderStatus.Pending)
            throw new DomainException("Only pending orders can be marked as paid.");

        Status = OrderStatus.Paid;
        StripePaymentIntentId = paymentIntentId;
        PaidAt = DateTime.UtcNow;
        SetUpdated();
        AddDomainEvent(new OrderPaidEvent(Id, UserId, paymentIntentId));
    }

    public void Cancel()
    {
        if (Status is OrderStatus.Fulfilled or OrderStatus.Refunded)
            throw new DomainException("Cannot cancel a fulfilled or refunded order.");

        Status = OrderStatus.Cancelled;
        SetUpdated();
        AddDomainEvent(new OrderCancelledEvent(Id, UserId));
    }

    public void MarkFulfilled()
    {
        if (Status != OrderStatus.Paid)
            throw new DomainException("Only paid orders can be fulfilled.");

        Status = OrderStatus.Fulfilled;
        SetUpdated();
    }

    public void AddVouchers(IEnumerable<Voucher> vouchers)
    {
        _vouchers.AddRange(vouchers);
        SetUpdated();
    }
}

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Guid DealId { get; private set; }
    public string DealTitle { get; private set; } = default!;
    public Guid? DealOptionId { get; private set; }
    public string? OptionTitle { get; private set; }
    public Guid VendorId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalPrice => UnitPrice * Quantity;

    protected OrderItem() { }

    public static OrderItem Create(Guid orderId, Guid dealId, string dealTitle, Guid vendorId,
        decimal unitPrice, int quantity, Guid? dealOptionId = null, string? optionTitle = null)
    {
        if (quantity <= 0) throw new DomainException("Quantity must be at least 1.");
        if (unitPrice <= 0) throw new DomainException("Unit price must be greater than zero.");

        return new OrderItem
        {
            OrderId = orderId,
            DealId = dealId,
            DealTitle = dealTitle,
            VendorId = vendorId,
            UnitPrice = unitPrice,
            Quantity = quantity,
            DealOptionId = dealOptionId,
            OptionTitle = optionTitle,
        };
    }
}
