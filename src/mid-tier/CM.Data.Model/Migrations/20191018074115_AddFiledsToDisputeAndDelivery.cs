using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class AddFiledsToDisputeAndDelivery : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReadyForDeliveryDate",
                table: "OutcomeDocDeliveries",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "InitialPaymentMethod",
                table: "Disputes",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReadyForDeliveryDate",
                table: "OutcomeDocDeliveries");

            migrationBuilder.DropColumn(
                name: "InitialPaymentMethod",
                table: "Disputes");
        }
    }
}
