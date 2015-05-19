-- phpMyAdmin SQL Dump
-- version 4.2.10
-- http://www.phpmyadmin.net
--
-- Host: localhost:8889
-- Erstellungszeit: 20. Mai 2015 um 00:54
-- Server Version: 5.5.38
-- PHP-Version: 5.6.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Datenbank: `verleihsystem`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `inventar`
--

CREATE TABLE `inventar` (
  `id` bigint(32) unsigned NOT NULL,
  `type` int(10) unsigned NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `lendings`
--

CREATE TABLE `lendings` (
`id` int(10) unsigned NOT NULL,
  `borrower` varchar(8) NOT NULL,
  `item` bigint(32) unsigned NOT NULL,
  `lender` varchar(8) NOT NULL,
  `start` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `types`
--

CREATE TABLE `types` (
`id` int(10) unsigned NOT NULL,
  `description` text NOT NULL,
  `image` varchar(50) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` varchar(8) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` varchar(50) NOT NULL,
  `lender` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `inventar`
--
ALTER TABLE `inventar`
 ADD PRIMARY KEY (`id`), ADD KEY `type` (`type`);

--
-- Indizes für die Tabelle `lendings`
--
ALTER TABLE `lendings`
 ADD PRIMARY KEY (`id`), ADD KEY `lender` (`lender`), ADD KEY `action` (`borrower`,`item`,`end`);

--
-- Indizes für die Tabelle `types`
--
ALTER TABLE `types`
 ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
 ADD PRIMARY KEY (`id`), ADD KEY `lender` (`lender`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `lendings`
--
ALTER TABLE `lendings`
MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT für Tabelle `types`
--
ALTER TABLE `types`
MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `inventar`
--
ALTER TABLE `inventar`
ADD CONSTRAINT `inventar_ibfk_1` FOREIGN KEY (`type`) REFERENCES `types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
