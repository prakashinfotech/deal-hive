using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GrouponClone.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorCategoryFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Vendors",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vendors_CategoryId",
                table: "Vendors",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vendors_Categories_CategoryId",
                table: "Vendors",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vendors_Categories_CategoryId",
                table: "Vendors");

            migrationBuilder.DropIndex(
                name: "IX_Vendors_CategoryId",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Vendors");
        }
    }
}
