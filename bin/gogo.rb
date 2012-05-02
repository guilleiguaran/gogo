#!/usr/bin/env ruby

require "em-eventsource"
require "go/gtp"
require "json"

EM.run do
  exit unless ARGV[0]
  # Run our go player
  go = Go::GTP.run_gnugo
  puts "GNU Go started"

  # The url of the game
  url = "http://localhost:3000/games/#{ARGV[0]}"

  # Setup EventSource
  source = EventMachine::EventSource.new("#{url}/stream",
                                         {},
                                         { Accept: "text/event-stream" })
  source.on "gameplay" do |event_data|
    # parse received event data
    data = JSON.parse(event_data)

    if data['player'].to_s == '1'
      # make the received move
      go.play("B", data['move'])
      puts "B (enemy) moved on #{data['move']}"

      # now is the turn of gogo
      move = go.genmove("W")
      puts "W (I) is moving on #{move}"

      # send the move to the server
      data = { player: 2, move: move }
      http = EventMachine::HttpRequest.new(url).put body: data
    end
  end

  source.error do |error|
    puts "Error in stream: #{error}"
  end

  # join game
  puts "Joining the game..."
  http = EventMachine::HttpRequest.new("#{url}/join").get

  puts "Listening for events in #{url}/stream"
  source.start
end
