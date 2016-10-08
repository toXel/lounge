"use strict";

var _ = require("lodash");
var expect = require("chai").expect;

var Chan = require("../../src/models/chan");
var User = require("../../src/models/user");

describe("Chan", function() {
	describe("#sortUsers(irc)", function() {
		var network = {
			network: {
				options: {
					PREFIX: [
						{symbol: "~", mode: "q"},
						{symbol: "&", mode: "a"},
						{symbol: "@", mode: "o"},
						{symbol: "%", mode: "h"},
						{symbol: "+", mode: "v"}
					]
				}
			}
		};

		var prefixLookup = {};

		_.each(network.network.options.PREFIX, function(mode) {
			prefixLookup[mode.mode] = mode.symbol;
		});

		var makeUser = function(nick) {
			return new User({nick: nick}, prefixLookup);
		};

		var getUserNames = function(chan) {
			return chan.users.map(function(u) {
				return u.name;
			});
		};

		it("should sort a simple user list", function() {
			var chan = new Chan({users: [
				"JocelynD", "YaManicKill", "astorije", "xPaw", "Max-P"
			].map(makeUser)});
			chan.sortUsers(network);

			expect(getUserNames(chan)).to.deep.equal([
				"astorije", "JocelynD", "Max-P", "xPaw", "YaManicKill"
			]);
		});

		it("should group users by modes", function() {
			var chan = new Chan({users: [
				new User({nick: "JocelynD", modes: ["a", "o"]}, prefixLookup),
				new User({nick: "YaManicKill", modes: ["v"]}, prefixLookup),
				new User({nick: "astorije", modes: ["h"]}, prefixLookup),
				new User({nick: "xPaw", modes: ["q"]}, prefixLookup),
				new User({nick: "Max-P", modes: ["o"]}, prefixLookup),
			]});
			chan.sortUsers(network);

			expect(getUserNames(chan)).to.deep.equal([
				"xPaw", "JocelynD", "Max-P", "astorije", "YaManicKill"
			]);
		});

		it("should sort a mix of users and modes", function() {
			var chan = new Chan({users: [
				new User({nick: "JocelynD"}, prefixLookup),
				new User({nick: "YaManicKill", modes: ["o"]}, prefixLookup),
				new User({nick: "astorije"}, prefixLookup),
				new User({nick: "xPaw"}, prefixLookup),
				new User({nick: "Max-P", modes: ["o"]}, prefixLookup),
			]});
			chan.sortUsers(network);

			expect(getUserNames(chan)).to.deep.equal(
				["Max-P", "YaManicKill", "astorije", "JocelynD", "xPaw"]
			);
		});

		it("should be case-insensitive", function() {
			var chan = new Chan({users: ["aB", "Ad", "AA", "ac"].map(makeUser)});
			chan.sortUsers(network);

			expect(getUserNames(chan)).to.deep.equal(["AA", "aB", "ac", "Ad"]);
		});

		it("should parse special characters successfully", function() {
			var chan = new Chan({users: [
				"[foo", "]foo", "(foo)", "{foo}", "<foo>", "_foo", "@foo", "^foo",
				"&foo", "!foo", "+foo", "Foo"
			].map(makeUser)});
			chan.sortUsers(network);

			expect(getUserNames(chan)).to.deep.equal([
				"!foo", "&foo", "(foo)", "+foo", "<foo>", "@foo", "[foo", "]foo",
				"^foo", "_foo", "Foo", "{foo}"
			]);
		});
	});
});
