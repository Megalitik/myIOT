
	IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'myIOT')
	BEGIN
		CREATE DATABASE [myIOT]
	END
		GO
		USE [myIOT]
		GO


		-- A tabela dbo.users é gerada pelo Entity Framework. É necessário executar o comando no projeto MIOTWebAPI:
		-- dotnet ef database update --context AppDbContext

		--Por exemplo:
		-- PS C:\Users\Carvalho\Desktop\myIOT\MIOTWebAPI> dotnet ef database update --context AppDbContext



		-- Criar a tabela dbo.Devices
		IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Devices' and xtype='U')
		BEGIN
			CREATE TABLE [dbo].[Devices](
				[deviceId] [int] IDENTITY(1,1) NOT NULL,
				[deviceName] [varchar](max) NULL,
				[deviceUserId] [int] NOT NULL,
				PRIMARY KEY CLUSTERED 
				(
					[deviceId] ASC
				)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
			) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]


			ALTER TABLE [dbo].[Devices]  WITH CHECK ADD FOREIGN KEY([deviceUserId])
			REFERENCES [dbo].[users] ([Id])
		
		END


		-- Criar a tabela DeviceWidgets
		IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DeviceWidgets' and xtype='U')
		BEGIN
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


			ALTER TABLE [dbo].[DeviceWidgets]  WITH CHECK ADD  CONSTRAINT [FK_DeviceWidgets_Devices] FOREIGN KEY([deviceId])
			REFERENCES [dbo].[Devices] ([deviceId])
			

			ALTER TABLE [dbo].[DeviceWidgets] CHECK CONSTRAINT [FK_DeviceWidgets_Devices]
		END

		-- Criar a tabela DeviceMessages
		IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DeviceMessages' and xtype='U')
		BEGIN
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


			ALTER TABLE [dbo].[DeviceMessages]  WITH CHECK ADD FOREIGN KEY([deviceId])
			REFERENCES [dbo].[Devices] ([deviceId])
		END

		-- Criar a tabela DeviceCommand
		IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DeviceCommand' and xtype='U')
		BEGIN
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


			ALTER TABLE [dbo].[DeviceCommand]  WITH CHECK ADD FOREIGN KEY([deviceId])
			REFERENCES [dbo].[Devices] ([deviceId])

		END


