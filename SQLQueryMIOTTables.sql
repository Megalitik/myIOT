/* 
Table Users
	ID
	Name
	Role
	Email
	Password

Table Roles
	ID
	Name

Table Devices
	DeviceID
	DeviceType
	OwnerUserID

Table DeviceMessage
	MessageId
	MessageContent
	DeviceId

Table DeviceType
	ID
	Name

*/

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL 
  DROP TABLE dbo.Users; 
CREATE TABLE Users
(
	Id BIGINT NOT NULL IDENTITY(1,1)
   ,Name NVARCHAR(500) NOT NULL
   ,Role INT NOT NULL
   ,Email NVARCHAR(500) NOT NULL
   ,Password NVARCHAR(500) NOT NULL

)

IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL 
  DROP TABLE dbo.Roles; 
CREATE TABLE Roles
(
	Id BIGINT NOT NULL IDENTITY(1,1)
   ,Name NVARCHAR(500) NOT NULL
)

IF OBJECT_ID('dbo.DeviceMessage', 'U') IS NOT NULL 
  DROP TABLE dbo.DeviceMessage; 
CREATE TABLE DeviceMessage
(
	MessageId BIGINT NOT NULL IDENTITY(1,1)
   ,MessageContent NVARCHAR(500) NOT NULL
   ,DeviceId BIGINT NOT NULL
)

IF OBJECT_ID('dbo.Devices', 'U') IS NOT NULL 
  DROP TABLE dbo.Devices; 
CREATE TABLE Devices
(
	DeviceId BIGINT NOT NULL IDENTITY(1,1)
   ,Name NVARCHAR(500)
   ,DeviceType INT NOT NULL
   ,DeviceState BIT NOT NULL
   ,OwnerUserId BIGINT NOT NULL
)

IF OBJECT_ID('dbo.DeviceTypes', 'U') IS NOT NULL 
  DROP TABLE dbo.DeviceTypes; 
CREATE TABLE DeviceTypes
(
	ID INT NOT NULL IDENTITY(1,1)
   ,Name NVARCHAR(500) NOT NULL
)

