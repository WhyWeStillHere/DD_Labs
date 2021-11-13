package calculator;

import java.io.IOException;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;

public class Main {
  private static Logger logger = Logger.getLogger(Main.class.getName());

  public static void main(String[] args) {
    double a = 2;
    double b = 2;

    logger.log(Level.INFO, "Result of {0} * {1}: {2}", new Object[]{a, b, AdvancedCalculator.mult(a, b)});
  }
}
