require 'sprockets'
require 'sinatra'
require 'nest'
require 'json'
require './app'

map '/assets' do
  environment = Sprockets::Environment.new
  environment.append_path 'assets/javascripts'
  environment.append_path 'assets/stylesheets'
  environment.append_path 'assets/images'
  environment.append_path 'assets/sounds'
  run environment
end

map '/' do
  run App
end
