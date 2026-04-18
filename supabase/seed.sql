-- ─────────────────────────────────────────────────────────────────────────────
-- CityFix AI — Seed Data (25 realistic demo reports)
-- Run AFTER the migration script
-- ─────────────────────────────────────────────────────────────────────────────

-- Clusters first (reports reference them)
INSERT INTO duplicate_clusters (id, category, center_latitude, center_longitude, cluster_size, status, neighborhood, created_at)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'pothole',            37.7749, -122.4158, 3, 'submitted',    'Downtown',         NOW() - INTERVAL '4 days'),
  ('11111111-0000-0000-0000-000000000002', 'broken_streetlight', 37.7775, -122.4199, 3, 'under_review', 'Eastside/Northside', NOW() - INTERVAL '14 days'),
  ('11111111-0000-0000-0000-000000000003', 'illegal_dumping',    37.7729, -122.4250, 2, 'under_review', 'Northside/Westside', NOW() - INTERVAL '4 days'),
  ('11111111-0000-0000-0000-000000000004', 'pothole',            37.7718, -122.4187, 2, 'assigned',     'Northside',        NOW() - INTERVAL '21 days')
ON CONFLICT DO NOTHING;

-- ─── Reports ─────────────────────────────────────────────────────────────────
INSERT INTO reports (id, title, description, latitude, longitude, address, neighborhood, category, severity, ai_summary, urgency_score, impact_score, priority_score, priority_level, ai_reasoning, recommended_action, status, duplicate_cluster_id, created_at, updated_at)
VALUES
  (
    '22222222-0001-0000-0000-000000000001',
    'Large Pothole on Market Street',
    'Deep pothole approximately 2ft wide near pedestrian crossing, causing vehicles to swerve dangerously.',
    37.7751, -122.4155, '450 Market St', 'Downtown', 'pothole', 'high',
    'Large pothole near pedestrian crossing on a high-traffic arterial road.',
    88, 84, 87, 'critical',
    'High urgency due to proximity to pedestrian crossing and heavy traffic volume.',
    'Prioritize inspection and repair within 24 hours.',
    'submitted', '11111111-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0002-0000-0000-000000000002',
    'Broken Streetlight Near Eastside School',
    'Streetlight not functioning at corner of 5th and Oak, near Lincoln Elementary. Very dark at night.',
    37.7800, -122.4192, '5th & Oak Ave', 'Eastside', 'broken_streetlight', 'critical',
    'Non-functioning streetlight adjacent to an elementary school.',
    95, 90, 93, 'critical',
    'Critical safety hazard — proximity to school creates high risk for children.',
    'Emergency repair required within 24 hours.',
    'under_review', '11111111-0000-0000-0000-000000000002',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0003-0000-0000-000000000003',
    'Cracked Sidewalk Blocking Wheelchair Access',
    'Large crack and raised section on sidewalk making it impossible for wheelchair users to pass.',
    37.7695, -122.4135, '120 Westside Blvd', 'Westside', 'accessibility_hazard', 'high',
    'Severely damaged sidewalk creates ADA accessibility violation.',
    85, 80, 83, 'critical',
    'ADA compliance issue with direct impact on mobility-impaired residents.',
    'Temporary accessibility rerouting and urgent repair within 48 hours.',
    'in_progress', NULL,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0004-0000-0000-000000000004',
    'Illegal Dumping of Appliances',
    'Several old appliances (refrigerators, mattresses) dumped on the corner of Northside Ave and 3rd St.',
    37.7740, -122.4255, 'Northside Ave & 3rd St', 'Northside', 'illegal_dumping', 'medium',
    'Large pile of illegally dumped appliances creating public hazard.',
    68, 65, 67, 'high',
    'Environmental hazard and public nuisance.',
    'Schedule bulk waste removal within 3-5 business days.',
    'submitted', '11111111-0000-0000-0000-000000000003',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0005-0000-0000-000000000005',
    'Overflowing Trash Bin in Park',
    'Public trash bin at Central Park entrance overflowing for 3 days. Attracting pests.',
    37.7755, -122.4170, 'Central Park Entrance', 'Downtown', 'trash_overflow', 'medium',
    'Overflowing public trash receptacle in high-traffic park area.',
    55, 52, 54, 'medium',
    'Medium priority sanitation issue.',
    'Schedule immediate collection and increase pickup frequency.',
    'resolved', NULL,
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days'
  ),
  (
    '22222222-0006-0000-0000-000000000006',
    'Road Debris Blocking Lane',
    'Large pile of fallen tree branches blocking right lane on Eastside Highway.',
    37.7785, -122.4210, 'Eastside Hwy northbound', 'Eastside', 'road_obstruction', 'high',
    'Storm debris blocking traffic lane on major arterial road.',
    82, 78, 80, 'critical',
    'Active traffic hazard on high-volume road.',
    'Emergency clearance required within 2 hours.',
    'in_progress', NULL,
    NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'
  ),
  (
    '22222222-0007-0000-0000-000000000007',
    'Faded Stop Sign',
    'Stop sign at corner of Pine and 7th is severely faded and barely readable.',
    37.7715, -122.4140, 'Pine St & 7th Ave', 'Westside', 'broken_sign', 'medium',
    'Traffic stop sign severely weathered and unreadable.',
    58, 55, 57, 'medium',
    'Traffic safety concern. Unreadable stop sign can lead to accidents.',
    'Replace sign within 5 business days.',
    'assigned', NULL,
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days'
  ),
  (
    '22222222-0008-0000-0000-000000000008',
    'Pothole Cluster on Broadway Ave',
    'Multiple large potholes in a 50-meter stretch on Broadway. Road deteriorating rapidly.',
    37.7745, -122.4162, '800-850 Broadway Ave', 'Downtown', 'pothole', 'critical',
    'Cluster of multiple severe potholes on main arterial road.',
    84, 88, 86, 'critical',
    'Multiple reports confirm recurring degradation.',
    'Full road surface assessment and emergency patching within 48 hours.',
    'under_review', '11111111-0000-0000-0000-000000000001',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0009-0000-0000-000000000009',
    'Pothole Near Hospital Entrance',
    'Deep pothole right at the ambulance entrance of St. Mary''s Hospital.',
    37.7698, -122.4130, 'St. Mary''s Hospital Entrance', 'Northside', 'pothole', 'critical',
    'Severe pothole at hospital emergency vehicle access point.',
    97, 92, 95, 'critical',
    'Extreme urgency — pothole at hospital entrance impacts emergency response.',
    'IMMEDIATE repair required. Coordinate with hospital facilities.',
    'assigned', '11111111-0000-0000-0000-000000000004',
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0010-0000-0000-000000000010',
    'Missing Manhole Cover on 2nd Street',
    'Manhole cover completely missing on 2nd Street. Open hole is a serious safety hazard.',
    37.7785, -122.4200, '220 2nd St', 'Eastside', 'road_obstruction', 'critical',
    'Missing manhole cover creating open road hazard.',
    98, 90, 95, 'critical',
    'Immediate life-safety threat.',
    'EMERGENCY: Barricade immediately and replace cover within 2 hours.',
    'in_progress', NULL,
    NOW() - INTERVAL '6 hours', NOW() - INTERVAL '2 hours'
  ),
  (
    '22222222-0011-0000-0000-000000000011',
    'Sidewalk Crack Near Bus Stop',
    'Large crack in sidewalk near bus stop on Westside Rd. Elderly residents having trouble.',
    37.7760, -122.4200, 'Westside Rd Bus Stop', 'Westside', 'damaged_sidewalk', 'medium',
    'Significant sidewalk crack adjacent to a bus stop.',
    72, 68, 71, 'high',
    'Bus stop proximity increases daily impact.',
    'Inspect and schedule repair within 3-5 days.',
    'submitted', NULL,
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
  ),
  (
    '22222222-0012-0000-0000-000000000012',
    'Streetlight Outage — Downtown Block',
    'Two streetlights out on Main St between 3rd and 4th. Very dark.',
    37.7748, -122.4152, 'Main St 3rd-4th', 'Downtown', 'broken_streetlight', 'high',
    'Two consecutive streetlights non-functional on main commercial street.',
    76, 72, 75, 'high',
    'Multiple streetlights out on main commercial corridor.',
    'Repair or replace both fixtures within 48 hours.',
    'under_review', '11111111-0000-0000-0000-000000000002',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0013-0000-0000-000000000013',
    'Flooding at Northside Underpass',
    'Water accumulation at the underpass on Northside Dr after rain. Road impassable.',
    37.7742, -122.4250, 'Northside Dr Underpass', 'Northside', 'flooding', 'high',
    'Underpass flooding creating impassable road condition.',
    88, 82, 86, 'critical',
    'Flooding at underpass blocks critical transit route.',
    'Deploy pumping equipment and inspect drainage system immediately.',
    'submitted', NULL,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  ),
  (
    '22222222-0014-0000-0000-000000000014',
    'Graffiti on Eastside Library',
    'Large graffiti tag on the side wall of the Eastside Public Library.',
    37.7790, -122.4195, 'Eastside Public Library', 'Eastside', 'graffiti', 'low',
    'Graffiti vandalism on public library building.',
    28, 22, 26, 'low',
    'Low safety priority but impacts community aesthetics.',
    'Schedule graffiti removal within 2 weeks.',
    'resolved', NULL,
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days'
  ),
  (
    '22222222-0015-0000-0000-000000000015',
    'Pothole Worsening After Rain',
    'Pothole on Oak Ave has doubled in size after last week''s rain. Very dangerous for cyclists.',
    37.7752, -122.4157, '340 Oak Ave', 'Downtown', 'pothole', 'high',
    'Rapidly expanding pothole on mixed-use road with bicycle lane.',
    80, 76, 79, 'high',
    'Expanding pothole suggests deeper infrastructure issue.',
    'Sub-base inspection and comprehensive repair within 48 hours.',
    'submitted', '11111111-0000-0000-0000-000000000001',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
  ),
  (
    '22222222-0016-0000-0000-000000000016',
    'Broken Bench in Northside Park',
    'Park bench with broken slats and exposed nails. Children playing nearby.',
    37.7738, -122.4248, 'Northside Community Park', 'Northside', 'other', 'medium',
    'Damaged park bench with exposed sharp components near play area.',
    52, 45, 49, 'medium',
    'Moderate priority due to exposed nails near children''s play area.',
    'Remove or barricade bench and schedule replacement within 1 week.',
    'submitted', NULL,
    NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'
  ),
  (
    '22222222-0017-0000-0000-000000000017',
    'Illegal Dumping — Westside Alley',
    'Construction waste illegally dumped in Westside alley, blocking access.',
    37.7718, -122.4145, 'Westside Alley off 8th', 'Westside', 'illegal_dumping', 'medium',
    'Large construction waste dump in residential alley.',
    62, 60, 61, 'high',
    'Construction debris blocking residential access.',
    'Investigate source and schedule removal within 3 days.',
    'under_review', '11111111-0000-0000-0000-000000000003',
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0018-0000-0000-000000000018',
    'Broken Traffic Signal — Northside Intersection',
    'Traffic light at Northside Ave and 5th cycling incorrectly. Both directions getting green.',
    37.7744, -122.4252, 'Northside Ave & 5th St', 'Northside', 'road_obstruction', 'critical',
    'Malfunctioning traffic signal simultaneously showing conflicting greens.',
    99, 95, 97, 'critical',
    'CRITICAL: Simultaneous green signals is a direct collision hazard.',
    'EMERGENCY: Deploy traffic control officer immediately.',
    'in_progress', NULL,
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'
  ),
  (
    '22222222-0019-0000-0000-000000000019',
    'Damaged Sidewalk Near Northside School',
    'Buckled and cracked sidewalk along Northside Elementary School drop-off zone.',
    37.7800, -122.4188, 'Northside Elementary School', 'Northside', 'damaged_sidewalk', 'high',
    'Severely damaged sidewalk in school drop-off zone.',
    82, 80, 81, 'critical',
    'School proximity and child safety makes this high priority.',
    'Emergency repair before next school day.',
    'submitted', NULL,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  ),
  (
    '22222222-0020-0000-0000-000000000020',
    'Trash Overflow — Eastside Commercial District',
    'Bins behind restaurants on Eastside Commercial Strip overflowing with food waste.',
    37.7782, -122.4205, 'Eastside Commercial Strip', 'Eastside', 'trash_overflow', 'medium',
    'Commercial food waste overflow in busy district.',
    60, 55, 58, 'medium',
    'Sanitation issue in commercial area.',
    'Commercial sanitation enforcement notice and immediate collection.',
    'resolved', NULL,
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days'
  ),
  (
    '22222222-0021-0000-0000-000000000021',
    'Pothole — Northside Residential Road',
    'Deep pothole on Northside residential street. Has been there for 3 weeks.',
    37.7736, -122.4244, '78 Northside Crescent', 'Northside', 'pothole', 'medium',
    'Persistent pothole on residential road unaddressed for over 3 weeks.',
    65, 58, 62, 'high',
    'Time unresolved increases urgency. Suggests systemic neglect.',
    'Schedule repair and review area for additional maintenance.',
    'submitted', '11111111-0000-0000-0000-000000000004',
    NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'
  ),
  (
    '22222222-0022-0000-0000-000000000022',
    'Broken Streetlight — Northside Park Walk',
    'Streetlight along Northside park walking path has been out for 2 weeks.',
    37.7730, -122.4240, 'Northside Park Walking Path', 'Northside', 'broken_streetlight', 'medium',
    'Park pathway lighting outage creating unsafe conditions.',
    70, 65, 68, 'high',
    '2-week outage suggests maintenance backlog.',
    'Schedule repair within 48 hours.',
    'submitted', '11111111-0000-0000-0000-000000000002',
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'
  ),
  (
    '22222222-0023-0000-0000-000000000023',
    'Water Main Leak — Downtown',
    'Water bubbling up through road surface near Main and 2nd.',
    37.7748, -122.4160, 'Main St & 2nd Ave', 'Downtown', 'flooding', 'critical',
    'Suspected water main leak with surface water emergence.',
    90, 85, 88, 'critical',
    'Potential infrastructure failure. Water main leaks can lead to sinkholes.',
    'Contact utilities emergency line immediately. Cordon off area.',
    'in_progress', NULL,
    NOW() - INTERVAL '12 hours', NOW() - INTERVAL '6 hours'
  ),
  (
    '22222222-0024-0000-0000-000000000024',
    'Damaged Sidewalk — Westside Elderly Care Facility',
    'Collapsed sidewalk section outside Westside Senior Living. Residents cannot safely exit.',
    37.7710, -122.4138, 'Westside Senior Living', 'Westside', 'accessibility_hazard', 'critical',
    'Collapsed sidewalk blocking primary exit of senior care facility.',
    94, 92, 93, 'critical',
    'Critical: elderly residents cannot safely exit facility.',
    'IMMEDIATE emergency repair. Coordinate with facility for temporary access.',
    'under_review', NULL,
    NOW() - INTERVAL '36 hours', NOW() - INTERVAL '12 hours'
  ),
  (
    '22222222-0025-0000-0000-000000000025',
    'Graffiti — Northside Underpass',
    'Extensive graffiti covering the Northside underpass walls. Been there for months.',
    37.7735, -122.4250, 'Northside Underpass', 'Northside', 'graffiti', 'low',
    'Extensive long-standing graffiti on public infrastructure.',
    22, 18, 20, 'low',
    'Low safety risk but persistent neglect contributes to neighborhood decline.',
    'Schedule graffiti abatement as part of routine improvement plan.',
    'submitted', NULL,
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
  )
ON CONFLICT DO NOTHING;

-- ─── Area Insights ────────────────────────────────────────────────────────────
INSERT INTO area_insights (neighborhood, total_reports, unresolved_reports, avg_priority_score, avg_resolution_days, equity_flag, equity_score, top_issues, updated_at)
VALUES
  ('Northside',  9, 8, 72, 18.5, TRUE,  88, ARRAY['pothole', 'broken_streetlight', 'flooding'],            NOW()),
  ('Downtown',   7, 5, 78, 4.2,  FALSE, 45, ARRAY['pothole', 'flooding', 'broken_streetlight'],            NOW()),
  ('Eastside',   6, 4, 65, 6.8,  FALSE, 52, ARRAY['broken_streetlight', 'road_obstruction', 'damaged_sidewalk'], NOW()),
  ('Westside',   5, 3, 62, 5.5,  FALSE, 38, ARRAY['damaged_sidewalk', 'accessibility_hazard', 'broken_sign'], NOW())
ON CONFLICT (neighborhood) DO UPDATE SET
  total_reports       = EXCLUDED.total_reports,
  unresolved_reports  = EXCLUDED.unresolved_reports,
  avg_priority_score  = EXCLUDED.avg_priority_score,
  equity_flag         = EXCLUDED.equity_flag,
  equity_score        = EXCLUDED.equity_score,
  top_issues          = EXCLUDED.top_issues,
  updated_at          = NOW();
