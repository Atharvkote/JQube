package net.jqube.server.configs;

import net.jqube.server.configs.properties.RabbitMQProperties;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(RabbitMQProperties.class)
public class RabbitMQConfiguration {

    @Bean
    public TopicExchange scanCommandExchange(
            RabbitMQProperties properties
    ) {
        return ExchangeBuilder
                .topicExchange(properties.getScanCommandExchange())
                .durable(true)
                .build();
    }

    @Bean
    public TopicExchange scanResultExchange(
            RabbitMQProperties properties
    ) {
        return ExchangeBuilder
                .topicExchange(properties.getScanResultExchange())
                .durable(true)
                .build();
    }

    @Bean
    public DirectExchange scanDeadLetterExchange(
            RabbitMQProperties properties
    ) {
        return ExchangeBuilder
                .directExchange(properties.getScanDeadLetterExchange())
                .durable(true)
                .build();
    }

    @Bean
    public Queue scanJobQueue(
            RabbitMQProperties properties
    ) {
        return QueueBuilder
                .durable(properties.getScanJobQueue())
                .quorum()
                .deadLetterExchange(properties.getScanDeadLetterExchange())
                .deadLetterRoutingKey(properties.getScanDeadLetterRoutingKey())
                .build();
    }

    @Bean
    public Queue scanResultQueue(
            RabbitMQProperties properties
    ) {
        return QueueBuilder
                .durable(properties.getScanResultQueue())
                .quorum()
                .deadLetterExchange(properties.getScanDeadLetterExchange())
                .deadLetterRoutingKey(properties.getScanDeadLetterRoutingKey())
                .build();
    }

    @Bean
    public Queue scanDeadLetterQueue(
            RabbitMQProperties properties
    ) {
        return QueueBuilder
                .durable(properties.getScanDeadLetterQueue())
                .quorum()
                .build();
    }

    @Bean
    public Binding scanJobBinding(
            Queue scanJobQueue,
            TopicExchange scanCommandExchange,
            RabbitMQProperties properties
    ) {
        return BindingBuilder
                .bind(scanJobQueue)
                .to(scanCommandExchange)
                .with(properties.getScanRequestedRoutingKey());
    }

    @Bean
    public Binding scanResultBinding(
            Queue scanResultQueue,
            TopicExchange scanResultExchange,
            RabbitMQProperties properties
    ) {
        return BindingBuilder
                .bind(scanResultQueue)
                .to(scanResultExchange)
                .with(properties.getScanCompletedRoutingKey());
    }

    @Bean
    public Binding scanDeadLetterBinding(
            Queue scanDeadLetterQueue,
            DirectExchange scanDeadLetterExchange,
            RabbitMQProperties properties
    ) {
        return BindingBuilder
                .bind(scanDeadLetterQueue)
                .to(scanDeadLetterExchange)
                .with(properties.getScanDeadLetterRoutingKey());
    }

    @Bean
    public Jackson2JsonMessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter
    ) {
        SimpleRabbitListenerContainerFactory factory =
                new SimpleRabbitListenerContainerFactory();

        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setAcknowledgeMode(
                org.springframework.amqp.core.AcknowledgeMode.MANUAL
        );

        factory.setPrefetchCount(1);
        factory.setConcurrentConsumers(2);
        factory.setMaxConcurrentConsumers(10);

        return factory;
    }
}