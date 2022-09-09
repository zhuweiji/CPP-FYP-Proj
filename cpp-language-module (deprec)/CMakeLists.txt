cmake_minimum_required(VERSION 3.10)

# set the project name
project(FYP)

# add the executable
add_executable(
    FYP test.cpp
    )

include_directories(include)

# find_package(RTTR CONFIG REQUIRED Core)
# target_link_libraries(FYP RTTR::Core_Lib_STL) # rttr as static library and static runtime library
