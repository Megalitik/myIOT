IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'myIOT')
	BEGIN
		CREATE DATABASE [myIOT]
	END

USE [myIOT]
GO

-- A tabela dbo.users é gerada pelo Entity Framework. É necessário correr o comando :
-- dotnet ef database update --context AppDbContext

--Por exemplo:
-- PS C:\Users\Carvalho\Desktop\myIOT\MIOTWebAPI> dotnet ef database update --context AppDbContext



-- Criar a tabela dbo.Devices

ALTER TABLE [dbo].[Devices] DROP CONSTRAINT [FK__Devices__deviceU__164452B1]
GO

ALTER TABLE [dbo].[Devices] DROP CONSTRAINT [FK__Devices__deviceU__145C0A3F]
GO

/****** Object:  Table [dbo].[Devices]    Script Date: 05-05-2023 22:07:55 ******/
DROP TABLE [dbo].[Devices]
GO

/****** Object:  Table [dbo].[Devices]    Script Date: 05-05-2023 22:07:55 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[Devices](
	[deviceId] [int] IDENTITY(1,1) NOT NULL,
	[deviceName] [varchar](max) NULL,
	[deviceUserId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[deviceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[Devices]  WITH CHECK ADD FOREIGN KEY([deviceUserId])
REFERENCES [dbo].[users] ([Id])
GO

ALTER TABLE [dbo].[Devices]  WITH CHECK ADD FOREIGN KEY([deviceUserId])
REFERENCES [dbo].[users] ([Id])
GO


-- Criar a tabela DeviceWidgets

ALTER TABLE [dbo].[DeviceWidgets] DROP CONSTRAINT [FK_DeviceWidgets_Devices]
GO

/****** Object:  Table [dbo].[DeviceWidgets]    Script Date: 05-05-2023 22:09:48 ******/
DROP TABLE [dbo].[DeviceWidgets]
GO

/****** Object:  Table [dbo].[DeviceWidgets]    Script Date: 05-05-2023 22:09:48 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[DeviceWidgets](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[deviceId] [int] NOT NULL,
	[MessageTable] [bit] NOT NULL,
	[SendCommands] [bit] NOT NULL,
	[LineChart] [bit] NOT NULL,
 CONSTRAINT [PK_DeviceWidgets] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE [dbo].[DeviceWidgets]  WITH CHECK ADD  CONSTRAINT [FK_DeviceWidgets_Devices] FOREIGN KEY([deviceId])
REFERENCES [dbo].[Devices] ([deviceId])
GO

ALTER TABLE [dbo].[DeviceWidgets] CHECK CONSTRAINT [FK_DeviceWidgets_Devices]
GO



-- Criar a tabela DeviceMessages

ALTER TABLE [dbo].[DeviceMessages] DROP CONSTRAINT [FK__DeviceMes__devic__1920BF5C]
GO

/****** Object:  Table [dbo].[DeviceMessages]    Script Date: 05-05-2023 22:10:42 ******/
DROP TABLE [dbo].[DeviceMessages]
GO

/****** Object:  Table [dbo].[DeviceMessages]    Script Date: 05-05-2023 22:10:42 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[DeviceMessages](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[deviceId] [int] NOT NULL,
	[Message] [varchar](max) NULL,
	[MessageDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[DeviceMessages]  WITH CHECK ADD FOREIGN KEY([deviceId])
REFERENCES [dbo].[Devices] ([deviceId])
GO


-- Criar a tabela DeviceCommand

ALTER TABLE [dbo].[DeviceCommand] DROP CONSTRAINT [FK__DeviceCom__devic__1BFD2C07]
GO

/****** Object:  Table [dbo].[DeviceCommand]    Script Date: 05-05-2023 22:11:19 ******/
DROP TABLE [dbo].[DeviceCommand]
GO

/****** Object:  Table [dbo].[DeviceCommand]    Script Date: 05-05-2023 22:11:19 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[DeviceCommand](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[deviceId] [int] NOT NULL,
	[Name] [varchar](max) NULL,
	[Command] [varchar](max) NULL,
	[Payload] [varchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[DeviceCommand]  WITH CHECK ADD FOREIGN KEY([deviceId])
REFERENCES [dbo].[Devices] ([deviceId])
GO


