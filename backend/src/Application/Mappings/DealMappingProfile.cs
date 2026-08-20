using AutoMapper;
using GrouponClone.Application.Features.Deals.Queries;
using GrouponClone.Domain.Entities;

namespace GrouponClone.Application.Mappings;

public class DealMappingProfile : Profile
{
    public DealMappingProfile()
    {
        CreateMap<Deal, DealSummaryResponse>()
            .ForMember(d => d.DiscountPercent, opt => opt.MapFrom(s => s.GetDiscountPercent()))
            .ForMember(d => d.PrimaryImageUrl, opt => opt.MapFrom(s =>
                s.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                ?? s.Images.Select(i => i.Url).FirstOrDefault()
                ?? ""))
            .ForMember(d => d.VendorName, opt => opt.MapFrom(s => s.Vendor.BusinessName))
            .ForMember(d => d.VendorCity, opt => opt.MapFrom(s => s.Vendor.City))
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.CategorySlug, opt => opt.MapFrom(s => s.Category.Slug));

        CreateMap<Deal, DealDetailResponse>()
            .IncludeBase<Deal, DealSummaryResponse>()
            .ForMember(d => d.Highlights, opt => opt.MapFrom(s =>
                string.IsNullOrEmpty(s.Highlights)
                    ? new List<string>()
                    : System.Text.Json.JsonSerializer.Deserialize<List<string>>(s.Highlights) ?? new List<string>()))
            .ForMember(d => d.Options, opt => opt.MapFrom(s => s.Options))
            .ForMember(d => d.Images, opt => opt.MapFrom(s => s.Images));

        CreateMap<DealOption, DealOptionResponse>();
        CreateMap<DealImage, DealImageResponse>();
    }
}
