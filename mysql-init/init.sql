CREATE DATABASE  IF NOT EXISTS `senai` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `senai`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: senai
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `fkid_usuario` int NOT NULL,
  `fkid_salas` int NOT NULL,
  `data_reserva` date NOT NULL,
  `horario_inicio` time NOT NULL,
  `horario_fim` time NOT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `idx_reserva_sala_data` (`fkid_salas`,`data_reserva`),
  KEY `idx_reserva_usuario` (`fkid_usuario`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`fkid_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`fkid_salas`) REFERENCES `salas` (`id_salas`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,5,20,'2026-03-28','19:00:00','20:00:00'),(2,1,10,'2026-03-28','19:00:00','20:00:00'),(3,3,10,'2026-03-28','14:00:00','15:00:00'),(4,3,12,'2026-03-28','14:00:00','15:00:00'),(5,1,15,'2026-03-28','14:00:00','15:00:00'),(6,1,5,'2026-03-28','14:00:00','15:00:00'),(7,5,5,'2026-03-28','19:00:00','20:00:00'),(8,5,5,'2025-04-28','19:00:00','20:00:00');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salas`
--

DROP TABLE IF EXISTS `salas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salas` (
  `id_salas` int NOT NULL AUTO_INCREMENT,
  `nome_da_sala` varchar(255) NOT NULL,
  `capacidade` int NOT NULL,
  `localizacao` varchar(255) NOT NULL,
  `equipamentos` varchar(255) NOT NULL,
  PRIMARY KEY (`id_salas`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salas`
--

LOCK TABLES `salas` WRITE;
/*!40000 ALTER TABLE `salas` DISABLE KEYS */;
INSERT INTO `salas` VALUES (1,'A1',16,'Bloco A','Projetores, Lousa, Cadeiras'),(2,'A2',16,'Bloco A','Computadores, Cadeiras, Lousa'),(3,'A3',16,'Bloco A','Simuladores, Lousa, Cadeiras'),(4,'A4',20,'Bloco A','Projetores, Cadeiras, Ar-condicionado'),(5,'A5',16,'Bloco A','Projetores, Lousa, Cadeiras'),(6,'A6',20,'Bloco A','Máquinas Pneumáticas, Lousa, Cadeiras'),(7,'COEL',16,'Bloco B','Ferramentas Elétricas, Lousa'),(8,'ITEL1',16,'Bloco B','Computadores, Cadeiras, Lousa'),(9,'ITEL2',16,'Bloco B','Computadores, Lousa, Cadeiras'),(10,'TOR',20,'Bloco B','Máquinas de Tornearia, Lousa'),(11,'AJFR',16,'Bloco B','Fresadoras, Lousa'),(12,'CNC',16,'Bloco C','Máquinas CNC, Lousa'),(13,'MMC',16,'Bloco C','Ferramentas de Manutenção, Lousa'),(14,'SOLD',16,'Bloco C','Equipamentos de Soldagem, Lousa'),(15,'B2',32,'Bloco B','Cadeiras, Projetores'),(16,'B3',32,'Bloco B','Cadeiras, Projetores'),(17,'B5',40,'Bloco B','Cadeiras, Projetores, Computadores'),(18,'B6',32,'Bloco B','Cadeiras, Projetores'),(19,'B7',32,'Bloco B','Cadeiras, Projetores'),(20,'B8',20,'Bloco B','Computadores, Lousa');
/*!40000 ALTER TABLE `salas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `cpf` char(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `telefone` char(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(20) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'12345678901','João Silva','11987654321','joao.silva@email.com','senha123'),(2,'23456789012','Maria Oliveira','11976543210','maria.oliveira@email.com','senha456'),(3,'34567890123','Carlos Santos','11965432109','carlos.santos@email.com','senha789'),(4,'45678901234','Ana Souza','11954321098','ana.souza@email.com','senha321'),(5,'56789012345','Pedro Lima','11943210987','pedro.lima@email.com','senha654'),(6,'12345678909','a','12345678909','a@a','123');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'senai'
--

--
-- Dumping routines for database 'senai'
--
/*!50003 DROP FUNCTION IF EXISTS `total_reservas_por_sala` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`alunods`@`%` FUNCTION `total_reservas_por_sala`(idSala INT) RETURNS int
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE total INT;

    SELECT COUNT(*) INTO total
    FROM reservas
    WHERE fkid_salas = idSala;

    RETURN total;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `ListarReservasPorData` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`alunods`@`%` PROCEDURE `ListarReservasPorData`(IN p_data DATE)
BEGIN
  SELECT 
  r.id_reserva, 
  u.nome, 
  s.nome_da_sala as "Sala Reservada", 
  r.horario_inicio,     
  r.horario_fim
  FROM reservas r
  JOIN usuario u ON r.fkid_usuario = u.id_usuario
  JOIN salas s ON r.fkid_salas = s.id_salas
  WHERE r.data_reserva = p_data
  ORDER BY u.nome, s.nome_da_sala;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-23 15:42:11
