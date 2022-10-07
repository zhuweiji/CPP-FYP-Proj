#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#include "../../doctest.h"

TEST_CASE("1"){
    SUBCASE("Complex Number class should be defined")
    {
        ComplexNumber obj;
    }
}


TEST_CASE("2 should not execute"){
    SUBCASE("hello"){
        REQUIRE(1 == 2);
}
}


TEST_CASE("Your mum"){
    SUBCASE("hello"){
        REQUIRE(1 == 2);
}
}
