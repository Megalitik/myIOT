using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace MIOTWebAPI.Migrations
{
    public partial class usersTableaddRecoverPwdFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ResetPasswordExpirity",
                table: "users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResetPasswordToken",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResetPasswordExpirity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "ResetPasswordToken",
                table: "users");
        }
    }
}
