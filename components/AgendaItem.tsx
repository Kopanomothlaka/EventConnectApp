import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, MapPin, User } from 'lucide-react-native';
import { AgendaItem as AgendaItemType } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';

interface AgendaItemProps {
  item: AgendaItemType;
  onPress?: () => void;
}

export default function AgendaItem({ item, onPress }: AgendaItemProps) {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'session':
        return Colors.primary;
      case 'break':
        return Colors.accent;
      case 'networking':
        return Colors.secondary;
      default:
        return Colors.primary;
    }
  };

  const getTypeIcon = (type: string) => {
    const color = getTypeColor(type);
    switch (type) {
      case 'session':
        return <User size={16} color={color} />;
      case 'break':
        return <Clock size={16} color={color} />;
      case 'networking':
        return <User size={16} color={color} />;
      default:
        return <Clock size={16} color={color} />;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.startTime}>{formatTime(item.startTime)}</Text>
        <Text style={styles.endTime}>{formatTime(item.endTime)}</Text>
      </View>

      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {getTypeIcon(item.type)}
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.details}>
          {item.speaker && (
            <View style={styles.detailRow}>
              <User size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.speaker.name}</Text>
            </View>
          )}
          {item.location && (
            <View style={styles.detailRow}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  timeContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  startTime: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  endTime: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: 2,
  },
  typeIndicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  details: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
});